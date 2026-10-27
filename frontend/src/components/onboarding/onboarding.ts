// SentinelX — driver.js onboarding core
// Loads the library stylesheets (base → theme) and holds everything shared
// between the three onboarding surfaces:
//   1. workspace tour  (driver)     — auto on first dashboard visit, replayable
//   2. scanner hints    (hints)     — non-blocking beacons on /scan
//   3. get-started list (checklist) — persistent launcher in the app shell
// All state lives in localStorage so it survives reloads; every read/write is
// defensive (private mode / quota) and fails toward "don't nag the user".

import 'driver.js/dist/driver.css';
import 'driver.js/dist/hints.css';
import 'driver.js/dist/checklist.css';
import './driver-theme.css';

import { driver, type Config, type DriveStep, type Driver } from 'driver.js';

/** Fired after a tour ends so every live checklist re-syncs from storage. */
export const ONBOARDING_EVENT = 'sentinelx:onboarding-update';

const TOUR_SEEN_KEY = 'sentinelx:onboarding:tour-seen';
const HINTS_SEEN_KEY = 'sentinelx:onboarding:hints-seen';
const CHECKLIST_DONE_KEY = 'sentinelx:onboarding:checklist-done';

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string): void {
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    // Private mode — the tour simply offers itself again next visit.
  }
}

export const isTourSeen = (): boolean => readFlag(TOUR_SEEN_KEY);
export const markTourSeen = (): void => writeFlag(TOUR_SEEN_KEY);

export const areHintsSeen = (): boolean => readFlag(HINTS_SEEN_KEY);
export const markHintsSeen = (): void => writeFlag(HINTS_SEEN_KEY);

export function loadChecklistDone(): string[] {
  try {
    const raw = window.localStorage.getItem(CHECKLIST_DONE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function saveChecklistDone(ids: string[]): void {
  try {
    window.localStorage.setItem(CHECKLIST_DONE_KEY, JSON.stringify(ids));
  } catch {
    // Keep working in memory; persistence is best-effort.
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const IS_DESKTOP = (): boolean =>
  window.matchMedia('(min-width: 1024px)').matches;

/** True while any driver.js overlay is on screen — guards double starts. */
export function isDriverActive(): boolean {
  return document.body.classList.contains('driver-active');
}

/**
 * The workspace tour. Steps carry `data.desktopOnly` for targets that only
 * exist on the desktop layout (the off-canvas mobile sidebar), so the same
 * tour definition works at every width.
 */
export function buildTourSteps(): DriveStep[] {
  const steps: DriveStep[] = [
    {
      element: '[data-tour="sidebar"]',
      data: { desktopOnly: true },
      popover: {
        title: 'Your workspace',
        description:
          'Scans, history, watchlist, billing and settings — everything you do in SentinelX lives one click away in this rail.',
        side: 'right',
      },
    },
    {
      element: '[data-tour="welcome"]',
      popover: {
        title: 'Today at a glance',
        description:
          'Your posture in one line: how many contracts you have analysed, how many came back high or critical risk.',
      },
    },
    {
      element: '[data-tour="kpis"]',
      popover: {
        title: 'Live security metrics',
        description:
          'Totals, high/critical count, your average risk score, and how many contracts are under observation.',
        side: 'bottom',
      },
    },
    {
      element: '[data-tour="activity"]',
      popover: {
        title: 'Activity and risk mix',
        description:
          'Contracts analysed per day over the last two weeks, with the distribution of risk bands you have found.',
        side: 'top',
      },
    },
    {
      element: '[data-tour="recent"]',
      popover: {
        title: 'Every scan is kept',
        description:
          'Score, risk band, flagged signals and timestamp for each analysis — click through for the full report.',
        side: 'top',
      },
    },
    {
      element: '[data-tour="quick-actions"]',
      popover: {
        title: 'Quick actions',
        description:
          'Analyse a contract, monitor a token, or review plan usage from anywhere in the workspace.',
        side: 'left',
      },
    },
  ];

  return steps.filter((step) => !(step.data?.desktopOnly && !IS_DESKTOP()));
}

/** Fresh tour driver with the SentinelX popover theme and callbacks wired. */
export function createTourDriver(onEnd?: (reason?: string) => void): Driver {
  const config: Config = {
    steps: buildTourSteps(),
    showProgress: true,
    animate: !prefersReducedMotion(),
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.55,
    stageRadius: 14,
    popoverOffset: 14,
    skipMissingElement: true,
    overlayClickBehavior: 'close',
    smoothScroll: true,
    onPopoverRender: (popover) => {
      popover.nextButton.classList.add('sx-btn-next');
      popover.previousButton.classList.add('sx-btn-prev');
    },
    onDestroyed: (_element, _step, opts) => {
      if (opts.reason) markTourSeen();
      onEnd?.(opts.reason);
    },
  };
  return driver(config);
}
