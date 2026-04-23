/**
 * Central constants for external URLs and shared references.
 * Update these when final production URLs are confirmed.
 */

/**
 * Internal docs anchor used as the active docs destination across the site
 * while the external docs host (docs.sankash.in) is unreachable.
 * All public-facing docs CTAs should resolve here so users land on a working
 * quickstart/jump-link experience instead of a timing-out subdomain.
 */
export const SANKASH_DEVELOPERS_DOCS_URL = "/developers#developer-docs";

/** SanKash docs home — temporarily routed to internal fallback. */
export const SANKASH_DOCS_HOME_URL = SANKASH_DEVELOPERS_DOCS_URL;

/** SanKash API documentation intro — temporarily routed to internal fallback. */
export const SANKASH_DOCS_URL = SANKASH_DEVELOPERS_DOCS_URL;

/** Lending docs — temporarily routed to internal fallback. */
export const SANKASH_LENDING_DOCS_URL = SANKASH_DEVELOPERS_DOCS_URL;

/** Insurance docs — temporarily routed to internal fallback. */
export const SANKASH_INSURANCE_DOCS_URL = SANKASH_DEVELOPERS_DOCS_URL;

/** Payments docs — temporarily routed to internal fallback. */
export const SANKASH_PAYMENTS_DOCS_URL = SANKASH_DEVELOPERS_DOCS_URL;

/** Agent platform login */
export const AGENT_LOGIN_URL = "https://app.sankash.in/agent/auth/login";

/** Agent platform signup */
export const AGENT_SIGNUP_URL = "https://app.sankash.in/agent/onboarding/signup";
