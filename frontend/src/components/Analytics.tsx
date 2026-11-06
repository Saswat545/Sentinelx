import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CONSENT_KEY = 'sentinelx_cookie_consent';

/** Event dispatched by CookieBanner when the user accepts or declines. */
export const CONSENT_EVENT = 'sentinelx:consent';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

let gaLoaded = false;

function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function initGA() {
  if (gaLoaded) return;
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  // Never load analytics before the user has opted in
  if (!hasConsent()) return;

  gaLoaded = true;

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    (window.dataLayer = window.dataLayer || []).push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll track page views manually
  });
}

export function trackPageView(pagePath: string, pageTitle: string) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', eventName, params);
}

// Track specific SentinelX events
export function trackAnalysisStarted(inputType: 'address' | 'code') {
  trackEvent('analyzer_started', { input_type: inputType });
}

export function trackAnalysisCompleted(riskScore: number, riskLevel: string) {
  trackEvent('analyzer_completed', { risk_score: riskScore, risk_level: riskLevel });
}

export function trackAnalysisFailed(errorMessage: string) {
  trackEvent('analyzer_failed', { error: errorMessage.substring(0, 100) });
}

export function trackCTAClicked(location: string) {
  trackEvent('cta_clicked', { location });
}

/**
 * Analytics wrapper — initializes GA only after cookie consent and
 * records a page_view on every SPA route change.
 * Only active when VITE_GA_MEASUREMENT_ID is set.
 */
export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Consent may already be stored from a previous visit
    initGA();

    // Consent may arrive later in this session (banner appears after 2s)
    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === 'accepted') initGA();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return null;
}