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
  page_type?: string;
  source_type?: string;
  audience_type?: string;
  lead_source_type?: string;
  trip_amount?: number;
  file_uploaded?: boolean;
  file_type?: string;
  destination_type?: string;
  cta_location?: string;
  cta_label?: string;
  [key: string]: any;
}

// ── Page classification ──

export function classifyPage(pathname: string): string {
  if (pathname === "/") return "homepage";
  if (pathname.startsWith("/for-travel-agents")) return "agent";
  if (pathname.startsWith("/for-travelers")) return "traveler";
  if (pathname.startsWith("/developers")) return "integrations";
  if (pathname.startsWith("/solutions")) return "solutions";
  if (pathname.startsWith("/emi-calculator")) return "emi_calculator";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/insurance")) return "insurance";
  if (pathname.startsWith("/lending")) return "lending";
  if (pathname.startsWith("/payments")) return "payments";
  return "other";
}

/**
 * Core tracking function. Sends to GA4 + Meta + console (dev).
 * Skips /ops routes entirely.
 */
export function trackEvent(eventName: string, params: EventParams = {}) {
  if (IS_OPS_ROUTE()) return;

  const enrichedParams = {
    page_path: window.location.pathname,
    page_type: classifyPage(window.location.pathname),
    ...params,
  };

  // GA4
  if (window.gtag) {
    window.gtag("event", eventName, enrichedParams);
  }

  // Google Ads conversions — fire on confirmed success events only
  if (window.gtag) {
    const gadsConversions: Record<string, string> = {
      demo_request_submit: "AW-939281479/cilNCO7wzJMcEMeY8b8D",
      contact_form_submit: "AW-939281479/SxRgCPHwzJMcEMeY8b8D",
      sandbox_request_submit: "AW-939281479/9o-wCPTwzJMcEMeY8b8D",
      production_request_submit: "AW-939281479/3P-YCPfwzJMcEMeY8b8D",
      traveler_unlock_submit: "AW-939281479/H-TwCPrwzJMcEMeY8b8D",
      traveler_emi_enquiry: "AW-939281479/EBPACIXeipgcEMeY8b8D",
    };
    const sendTo = gadsConversions[eventName];
    if (sendTo) {
      window.gtag("event", "conversion", { send_to: sendTo });
      if (IS_DEV) {
        console.log(
          `%c[GAds] conversion → ${sendTo}`,
          "color: #f59e0b; font-weight: bold;"
        );
      }
    }
  }

  // Meta Pixel — map to standard events where possible
  if (window.fbq) {
    const metaMapping: Record<string, string> = {
      contact_form_submit: "Lead",
      demo_request_submit: "Lead",
      sandbox_request_submit: "Lead",
      production_request_submit: "Lead",
      traveler_unlock_submit: "Lead",
      traveler_emi_enquiry: "Lead",
      integration_question_submit: "Lead",
      traveler_quote_upload: "InitiateCheckout",
      agent_quote_upload: "InitiateCheckout",
      emi_calculator_view: "ViewContent",
      agent_signup_click: "CompleteRegistration",
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

// ── SPA Page View ──

export function trackPageView(pathname: string) {
  if (pathname.startsWith("/ops")) return;

  const pageType = classifyPage(pathname);

  // GA4 page_view
  if (window.gtag) {
    window.gtag("config", "G-TY2M6S2EKS", { page_path: pathname });
  }

  // Meta PageView
  if (window.fbq) {
    window.fbq("track", "PageView");
  }

  // Audience-specific page view events
  const audiencePageEvents: Record<string, string> = {
    agent: "page_view_agent",
    traveler: "page_view_traveler",
    integrations: "page_view_integrations",
    emi_calculator: "page_view_emi",
  };

  const audienceEvent = audiencePageEvents[pageType];
  if (audienceEvent) {
    trackEvent(audienceEvent, { page_path: pathname, page_type: pageType });
  }

  if (IS_DEV) {
    console.log(
      `%c[Analytics] page_view`,
      "color: #059669; font-weight: bold;",
      { page_path: pathname, page_type: pageType }
    );
  }
}

// ── Lead / conversion events ──

export const trackContactFormSubmit = (params: { source_type: string; audience_type: string }) =>
  trackEvent("contact_form_submit", params);

export const trackDemoRequestSubmit = (params: { audience_type?: string }) =>
  trackEvent("demo_request_submit", { source_type: "demo_request", ...params });

export const trackSandboxRequestSubmit = () =>
  trackEvent("sandbox_request_submit", { source_type: "sandbox_access_request", audience_type: "developer" });

export const trackProductionRequestSubmit = () =>
  trackEvent("production_request_submit", { source_type: "production_access_request", audience_type: "developer" });

export const trackTravelerQuoteUpload = (params: { file_uploaded: boolean; file_type?: string }) =>
  trackEvent("traveler_quote_upload", { audience_type: "traveler", ...params });

export const trackTravelerUnlockSubmit = (params: { trip_amount?: number }) =>
  trackEvent("traveler_unlock_submit", { audience_type: "traveler", source_type: "traveler_quote_unlock", ...params });

export const trackAgentQuoteUpload = (params: { file_uploaded: boolean; file_type?: string }) =>
  trackEvent("agent_quote_upload", { audience_type: "agent", ...params });

export const trackIntegrationQuestionSubmit = () =>
  trackEvent("integration_question_submit", { source_type: "integration_query", audience_type: "developer" });

// ── Commercial intent / CTA click events ──

export const trackAgentSignupClick = (params?: { cta_location?: string }) =>
  trackEvent("agent_signup_click", { audience_type: "agent", ...params });

export const trackAgentLoginClick = (params?: { cta_location?: string }) =>
  trackEvent("agent_login_click", { audience_type: "agent", ...params });

export const trackGetStartedAgentClick = (params?: { cta_location?: string }) =>
  trackEvent("get_started_agent_click", { audience_type: "agent", ...params });

export const trackUploadQuoteClick = (params?: { audience_type?: string; cta_location?: string }) =>
  trackEvent("upload_quote_click", params);

export const trackBookDemoClick = (params?: { cta_location?: string }) =>
  trackEvent("book_demo_click", params);

export const trackGetSandboxAccessClick = () =>
  trackEvent("get_sandbox_access_click", { audience_type: "developer" });

export const trackEmiCalculatorView = () =>
  trackEvent("emi_calculator_view", { source_type: "emi_calculator" });

export const trackEmiAmountChange = (params: { trip_amount: number; tenure?: number; emi_type?: string }) =>
  trackEvent("emi_amount_change", params);

export const trackDocsClick = (params?: { source_page?: string; source_cta?: string }) =>
  trackEvent("docs_click", { source_type: "docs", ...params });

export const trackSupportClick = (params?: { source_page?: string }) =>
  trackEvent("support_click", { source_type: "support", ...params });

// ── Engagement events ──

export const trackQuoteAnalysisRequested = (params?: { audience_type?: string }) =>
  trackEvent("quote_analysis_requested", params);

export const trackItineraryAnalysisOpened = () =>
  trackEvent("itinerary_analysis_opened", { source_type: "ops_itinerary" });

export const trackTravelerEmiEnquirySubmit = (params: { destination?: string; budget?: string }) =>
  trackEvent("traveler_emi_enquiry", { audience_type: "traveler", source_type: "traveler_emi_enquiry", ...params });
