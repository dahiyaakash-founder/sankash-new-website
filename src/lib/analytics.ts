/**
 * Centralized analytics tracking for GA4, Google Ads, and Meta Pixel.
 * 
 * GA4: window.gtag('event', ...)
 * Meta: window.fbq('track', ...) / window.fbq('trackCustom', ...)
 * 
 * All events are safe to call even if scripts haven't loaded yet.
 * Debug mode logs to console in development.
 */

// Extend window for gtag and fbq
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const IS_DEV = import.meta.env.DEV;
const IS_OPS_ROUTE = () => window.location.pathname.startsWith("/ops");

interface EventParams {
  page_path?: string;
  source_type?: string;
  audience_type?: string;
  trip_amount?: number;
  file_uploaded?: boolean;
  [key: string]: any;
}

/**
 * Core tracking function. Sends to GA4 + Meta + console (dev).
 * Skips /ops routes entirely.
 */
export function trackEvent(eventName: string, params: EventParams = {}) {
  if (IS_OPS_ROUTE()) return;

  const enrichedParams = {
    page_path: window.location.pathname,
    ...params,
  };

  // GA4
  if (window.gtag) {
    window.gtag("event", eventName, enrichedParams);
  }

  // Meta Pixel — map to standard events where possible
  if (window.fbq) {
    const metaMapping: Record<string, string> = {
      contact_form_submit: "Lead",
      demo_request_submit: "Lead",
      sandbox_request_submit: "Lead",
      production_request_submit: "Lead",
      traveler_unlock_submit: "Lead",
      integration_question_submit: "Lead",
      traveler_quote_upload: "InitiateCheckout",
      agent_quote_upload: "InitiateCheckout",
      emi_calculator_view: "ViewContent",
    };

    const standardEvent = metaMapping[eventName];
    if (standardEvent) {
      window.fbq("track", standardEvent, { content_name: eventName, ...enrichedParams });
    } else {
      window.fbq("trackCustom", eventName, enrichedParams);
    }
  }

  // Dev debug logging
  if (IS_DEV) {
    console.log(
      `%c[Analytics] ${eventName}`,
      "color: #0891b2; font-weight: bold;",
      enrichedParams
    );
  }
}

// ── Convenience helpers ──

export const trackContactFormSubmit = (params: { source_type: string; audience_type: string }) =>
  trackEvent("contact_form_submit", params);

export const trackDemoRequestSubmit = (params: { audience_type?: string }) =>
  trackEvent("demo_request_submit", { source_type: "demo_request", ...params });

export const trackSandboxRequestSubmit = () =>
  trackEvent("sandbox_request_submit", { source_type: "sandbox_access_request", audience_type: "developer" });

export const trackProductionRequestSubmit = () =>
  trackEvent("production_request_submit", { source_type: "production_access_request", audience_type: "developer" });

export const trackTravelerQuoteUpload = (params: { file_uploaded: boolean }) =>
  trackEvent("traveler_quote_upload", { audience_type: "traveler", ...params });

export const trackTravelerUnlockSubmit = (params: { trip_amount?: number }) =>
  trackEvent("traveler_unlock_submit", { audience_type: "traveler", source_type: "traveler_quote_unlock", ...params });

export const trackAgentQuoteUpload = (params: { file_uploaded: boolean }) =>
  trackEvent("agent_quote_upload", { audience_type: "agent", ...params });

export const trackAgentSignupClick = () =>
  trackEvent("agent_signup_click", { audience_type: "agent" });

export const trackAgentLoginClick = () =>
  trackEvent("agent_login_click", { audience_type: "agent" });

export const trackEmiCalculatorView = () =>
  trackEvent("emi_calculator_view", { source_type: "emi_calculator" });

export const trackEmiAmountChange = (params: { trip_amount: number; tenure?: number; emi_type?: string }) =>
  trackEvent("emi_amount_change", params);

export const trackDocsClick = (params?: { source_page?: string }) =>
  trackEvent("docs_click", { source_type: "docs", ...params });

export const trackSupportClick = (params?: { source_page?: string }) =>
  trackEvent("support_click", { source_type: "support", ...params });

export const trackIntegrationQuestionSubmit = () =>
  trackEvent("integration_question_submit", { source_type: "integration_query", audience_type: "developer" });
