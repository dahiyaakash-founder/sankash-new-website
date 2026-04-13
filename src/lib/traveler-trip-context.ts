import { supabase } from "@/integrations/supabase/client";

export type TravelerPreferenceKey =
  | "trip_priority"
  | "trip_type"
  | "improvement_goal"
  | "quote_status"
  | "date_flexibility"
  | "destination_flexibility"
  | "trip_focus"
  | "budget_calibration";

export type TravelerPreferences = Partial<Record<TravelerPreferenceKey, string>>;

export interface TravelerInspirationInput {
  type: "link" | "place" | "text" | "hotel" | "friend_tip" | "screenshot";
  value: string;
  label?: string;
}

export async function captureTravelerTripContext(params: {
  lead_id: string;
  preferences?: TravelerPreferences;
  inspiration_inputs?: TravelerInspirationInput[];
  optional_note?: string | null;
  stage?: "waiting" | "results";
  refresh?: boolean;
}) {
  const { data, error } = await supabase.functions.invoke("capture-traveler-trip-context", {
    body: params,
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as {
    success: boolean;
    traveler_output?: Record<string, unknown> | null;
    ops_summary?: string | null;
    fast_path_deferred_rollups?: boolean;
  };
}
