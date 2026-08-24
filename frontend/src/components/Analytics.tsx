import { useEffect } from 'react';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function initGA() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

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
 * Analytics wrapper component — initializes GA on mount.
 * Only active when VITE_GA_MEASUREMENT_ID is set.
 */
export function Analytics() {
  useEffect(() => {
    initGA();
  }, []);

  return null;
}
