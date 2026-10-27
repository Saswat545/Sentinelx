// SentinelX — onboarding provider (workspace tour + get-started checklist).
// Mounted once inside AppShell. The tour is a driver.js overlay that starts
// itself on a member's first dashboard visit and can be replayed from the
// checklist; the checklist is a persistent launcher whose items complete from
// real conditions (scans taken, watchlist length, tour seen) rather than
// trust — completion is persisted to localStorage and reconciled back into
// memory on storage and route changes so state survives remounts.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checklist, type Checklist } from 'driver.js/checklist';
import type { Driver } from 'driver.js';
import { useScans, useWatchlist } from '../../lib/scanStore';
import {
  IS_DESKTOP,
  ONBOARDING_EVENT,
  createTourDriver,
  isDriverActive,
  isTourSeen,
  loadChecklistDone,
  saveChecklistDone,
} from './onboarding';

type OnboardingContextValue = {
  startTour: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue>({
  startTour: () => {},
});

export function useOnboarding(): OnboardingContextValue {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats } = useScans();
  const { items: watchItems } = useWatchlist();

  const checklistRef = useRef<Checklist | null>(null);
  const statsRef = useRef(stats);
  const watchRef = useRef(watchItems);
  statsRef.current = stats;
  watchRef.current = watchItems;

  /** Re-seed completed items from storage, then re-evaluate live conditions. */
  const syncFromStorage = useCallback(() => {
    const cl = checklistRef.current;
    if (!cl) return;
    const current = new Set(cl.getProgress().completed);
    loadChecklistDone()
      .filter((id) => !current.has(id))
      .forEach((id) => cl.complete(id));
    cl.refresh();
  }, []);

  const startTourRef = useRef<() => void>(() => {});

  const startTour = useCallback(() => {
    if (isDriverActive()) return;

    const run = (attempt: number) => {
      // Another surface may have started a tour in the meantime.
      if (isDriverActive()) return;
      if (!document.querySelector('[data-tour="welcome"]')) {
        // Dashboard chunk/layout not on screen yet — bounded retry.
        if (attempt < 10) window.setTimeout(() => run(attempt + 1), 300);
        return;
      }
      const tour: Driver = createTourDriver(() => {
        syncFromStorage();
        window.dispatchEvent(new Event(ONBOARDING_EVENT));
      });
      tour.drive();
    };

    if (location.pathname !== '/dashboard') navigate('/dashboard');
    run(0);
  }, [location.pathname, navigate, syncFromStorage]);

  startTourRef.current = startTour;

  // First dashboard visit (desktop layout): play the tour once.
  useEffect(() => {
    if (location.pathname !== '/dashboard') return;
    if (isTourSeen() || !IS_DESKTOP()) return;
    const timer = window.setTimeout(() => startTourRef.current(), 900);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  // The checklist widget (library-managed DOM, appended to <body>).
  useEffect(() => {
    const cl = checklist({
      id: 'getting-started',
      title: 'Get started',
      description: 'Four steps to a live security profile.',
      completeTitle: "You're all set",
      completeDescription:
        'First scan, watchlist and tour done — your workspace is live.',
      completeLauncherText: 'All done',
      position: 'bottom-right',
      className: 'sx-checklist',
      completed: loadChecklistDone(),
      items: [
        {
          id: 'first-scan',
          title: 'Run your first contract scan',
          description: 'Address or Solidity source — the report lands in History.',
          href: '/scan',
          completeWhen: () => (statsRef.current?.total ?? 0) > 0,
        },
        {
          id: 'workspace-tour',
          title: 'Take the workspace tour',
          description: 'Sixty seconds on where everything lives.',
          action: () => startTourRef.current(),
          completeWhen: () => isTourSeen(),
        },
        {
          id: 'watchlist-contract',
          title: 'Watch a contract',
          description: 'Track an address and its risk posture over time.',
          href: '/watchlist',
          completeWhen: () => (watchRef.current?.length ?? 0) > 0,
        },
        {
          id: 'learn-scores',
          title: 'How the 0–100 score works',
          description: 'Model, features and SHAP in plain language.',
          href: '/how-it-works',
        },
      ],
      onEvent: (event) => {
        if (event.type === 'item_completed' || event.type === 'item_uncompleted') {
          saveChecklistDone(checklistRef.current?.getProgress().completed ?? []);
        }
      },
    });
    checklistRef.current = cl;
    cl.show();

    const onUpdate = () => syncFromStorage();
    window.addEventListener(ONBOARDING_EVENT, onUpdate);

    return () => {
      window.removeEventListener(ONBOARDING_EVENT, onUpdate);
      cl.hide();
      checklistRef.current = null;
    };
  }, [syncFromStorage]);

  // Live conditions can become true while this page is open (a scan finishes,
  // a watchlist item is added) — and route changes bring fresh mounts.
  useEffect(() => {
    syncFromStorage();
  }, [stats.total, watchItems.length, location.pathname, syncFromStorage]);

  const value = useMemo(() => ({ startTour }), [startTour]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}
