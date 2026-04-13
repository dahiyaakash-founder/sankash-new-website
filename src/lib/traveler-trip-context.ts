/**
 * Traveler Trip Context — lightweight session state for Build My Trip.
 *
 * Uses sessionStorage to persist trip state across page refreshes
 * while keeping the backend as source of truth for case identity.
 *
 * Codex owns case identity and resume mechanics.
 * This file only manages UI session pointers.
 */

const SESSION_KEY = "sankash_build_trip_session";

export interface TripSessionState {
  mode: "destination" | "explore" | "inspiration" | null;
  destination?: string;
  mood?: string;
  inspirationCount?: number;
  leadId?: string;
  analysisId?: string;
  step: string;
  resultStrength?: "strong" | "medium" | "weak";
  timestamp: number;
}

/** Save current trip session state */
export function saveTripSession(state: Partial<TripSessionState>): void {
  try {
    const existing = loadTripSession();
    const merged: TripSessionState = {
      mode: null,
      step: "mode-select",
      timestamp: Date.now(),
      ...existing,
      ...state,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage unavailable — ignore silently
  }
}

/** Load saved trip session state */
export function loadTripSession(): TripSessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as TripSessionState;

    // Expire sessions older than 30 minutes
    const MAX_AGE_MS = 30 * 60 * 1000;
    if (Date.now() - parsed.timestamp > MAX_AGE_MS) {
      clearTripSession();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/** Clear trip session */
export function clearTripSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
