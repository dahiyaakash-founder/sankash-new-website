import { classifyPage } from "@/lib/analytics";

const STORAGE_KEY = "sankash_traveler_intent_session_v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_PAGE_EVENTS = 20;

type PageVisit = {
  path: string;
  page_type: string;
  visited_at: string;
};

type IntentMarker =
  | "viewed_emi_section"
  | "opened_upload_section"
  | "started_quote_upload"
  | "added_more_files"
  | "submitted_contact_details";

interface TravelerIntentSessionState {
  version: string;
  session_id: string;
  first_seen_at: string;
  session_started_at: string;
  last_seen_at: string;
  session_count: number;
  return_visit_count: number;
  total_public_page_views: number;
  viewed_traveler_page: boolean;
  viewed_emi_page: boolean;
  viewed_emi_section: boolean;
  opened_upload_section: boolean;
  quote_upload_count: number;
  add_more_upload_count: number;
  contact_submit_count: number;
  upload_started_at: string | null;
  latest_upload_started_at: string | null;
  latest_contact_submitted_at: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  os_name: string | null;
  browser_name: string | null;
  page_sequence: PageVisit[];
}

interface IntentSnapshotContext {
  context: "initial_upload" | "add_more_files" | "contact_capture";
  file_count?: number;
  current_lead_id?: string | null;
}

function canUseBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function nowIso() {
  return new Date().toISOString();
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function detectDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobi|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

function detectOs(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macos";
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "ios";
  if (ua.includes("linux")) return "linux";
  return "unknown";
}

function detectBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "safari";
  if (ua.includes("firefox/")) return "firefox";
  return "unknown";
}

function defaultState(): TravelerIntentSessionState {
  const search = canUseBrowser() ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const userAgent = canUseBrowser() ? window.navigator.userAgent : "";

  return {
    version: "traveler-intent-session-v1",
    session_id: randomId(),
    first_seen_at: nowIso(),
    session_started_at: nowIso(),
    last_seen_at: nowIso(),
    session_count: 1,
    return_visit_count: 0,
    total_public_page_views: 0,
    viewed_traveler_page: false,
    viewed_emi_page: false,
    viewed_emi_section: false,
    opened_upload_section: false,
    quote_upload_count: 0,
    add_more_upload_count: 0,
    contact_submit_count: 0,
    upload_started_at: null,
    latest_upload_started_at: null,
    latest_contact_submitted_at: null,
    referrer: canUseBrowser() ? document.referrer || null : null,
    utm_source: search.get("utm_source"),
    utm_medium: search.get("utm_medium"),
    utm_campaign: search.get("utm_campaign"),
    device_type: detectDeviceType(userAgent),
    os_name: detectOs(userAgent),
    browser_name: detectBrowser(userAgent),
    page_sequence: [],
  };
}

function loadState(): TravelerIntentSessionState {
  if (!canUseBrowser()) return defaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<TravelerIntentSessionState>;
    return {
      ...defaultState(),
      ...parsed,
      page_sequence: Array.isArray(parsed.page_sequence) ? parsed.page_sequence.slice(0, MAX_PAGE_EVENTS) : [],
    };
  } catch {
    return defaultState();
  }
}

function saveState(state: TravelerIntentSessionState) {
  if (!canUseBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureActiveState() {
  const state = loadState();
  const lastSeen = new Date(state.last_seen_at).getTime();
  const now = Date.now();

  if (!Number.isFinite(lastSeen) || now - lastSeen > SESSION_TIMEOUT_MS) {
    state.session_id = randomId();
    state.session_started_at = nowIso();
    state.session_count += 1;
    state.return_visit_count = Math.max(0, state.session_count - 1);
  }

  state.last_seen_at = nowIso();
  saveState(state);
  return state;
}

export function recordTravelerPageVisit(pathname: string) {
  if (!canUseBrowser() || pathname.startsWith("/ops")) return;

  const state = ensureActiveState();
  const pageType = classifyPage(pathname);
  const alreadyLatest = state.page_sequence[0]?.path === pathname;

  if (!alreadyLatest) {
    state.page_sequence = [
      { path: pathname, page_type: pageType, visited_at: nowIso() },
      ...state.page_sequence,
    ].slice(0, MAX_PAGE_EVENTS);
    state.total_public_page_views += 1;
  }

  if (pageType === "traveler") state.viewed_traveler_page = true;
  if (pageType === "emi_calculator") state.viewed_emi_page = true;
  state.last_seen_at = nowIso();
  saveState(state);
}

export function markTravelerIntentSignal(marker: IntentMarker) {
  if (!canUseBrowser()) return;
  const state = ensureActiveState();
  const now = nowIso();

  if (marker === "viewed_emi_section") state.viewed_emi_section = true;
  if (marker === "opened_upload_section") state.opened_upload_section = true;
  if (marker === "started_quote_upload") {
    state.quote_upload_count += 1;
    state.upload_started_at = state.upload_started_at ?? now;
    state.latest_upload_started_at = now;
  }
  if (marker === "added_more_files") {
    state.add_more_upload_count += 1;
    state.latest_upload_started_at = now;
  }
  if (marker === "submitted_contact_details") {
    state.contact_submit_count += 1;
    state.latest_contact_submitted_at = now;
  }

  state.last_seen_at = now;
  saveState(state);
}

export function buildTravelerIntentSnapshot(context: IntentSnapshotContext) {
  const state = ensureActiveState();
  const uploadStartedAt = state.latest_upload_started_at ?? state.upload_started_at;
  const firstSeenAt = state.first_seen_at;
  const preUploadSeconds = uploadStartedAt
    ? Math.max(0, Math.round((new Date(uploadStartedAt).getTime() - new Date(firstSeenAt).getTime()) / 1000))
    : null;

  return {
    ...state,
    snapshot_context: context.context,
    snapshot_at: nowIso(),
    file_count: context.file_count ?? null,
    current_lead_id: context.current_lead_id ?? null,
    pages_visited_before_upload: state.page_sequence.map((entry) => entry.path),
    page_types_before_upload: Array.from(new Set(state.page_sequence.map((entry) => entry.page_type))),
    time_spent_before_upload_seconds: preUploadSeconds,
    returned_multiple_times: state.return_visit_count > 0 || state.session_count > 1,
  };
}
