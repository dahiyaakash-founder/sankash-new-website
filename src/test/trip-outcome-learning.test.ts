import { describe, expect, it } from "vitest";
import {
  buildLeadOutcomeSnapshot,
  buildOutcomeLearningSummary,
} from "../../supabase/functions/_shared/trip-outcome-learning";

describe("trip outcome learning", () => {
  it("captures a won lead with recommendation snapshot and timing signals", () => {
    const snapshot = buildLeadOutcomeSnapshot({
      lead: {
        id: "lead-won",
        full_name: "Rohan Malhotra",
        mobile_number: "9999999999",
        lead_source_page: "for-travelers",
        lead_source_type: "traveler_quote_upload",
        status: "converted",
        outcome: "won",
        assigned_to: "owner-1",
        quote_amount: 148000,
        created_at: "2026-04-10T09:00:00.000Z",
        updated_at: "2026-04-10T18:00:00.000Z",
        metadata_json: {
          traveler_intent_session: {
            latest_contact_submitted_at: "2026-04-10T10:00:00.000Z",
          },
          commercial_outcome: {
            conversion_date: "2026-04-10T18:00:00.000Z",
            product_converted: ["No-Cost EMI", "Travel Insurance"],
            loan_amount: 110000,
            booked_amount: 148000,
            pitch_angle_that_worked: "financing_first_close",
          },
        },
      },
      brain: {
        id: "brain-1",
        lead_id: "lead-won",
        lead_classification: "sales_lead",
        source_page: "for-travelers",
        analysis_count: 2,
        attachment_count: 3,
        destination_city: "Hanoi",
        destination_country: "Vietnam",
        domestic_or_international: "international",
        duration_days: 8,
        duration_nights: 7,
        travel_start_date: "2026-05-20",
        travel_end_date: "2026-05-27",
        traveller_count_total: 2,
        adults_count: 2,
        total_price: 148000,
        currency: "INR",
        package_mode: "flights_and_hotels",
        intent_score: 82,
        conversion_probability_band: "high",
        recommended_pitch_angle: "lead_with_emi_and_no_cost_emi",
        multi_itinerary_type: "same_trip_multi_seller",
        recommended_products_json: [{ code: "no_cost_emi" }, { code: "travel_insurance" }],
        suggested_pitch_sequence_json: [{ code: "no_cost_emi", title: "Pitch No-Cost EMI", why_now: "Customer is price sensitive." }],
        top_recommendations_json: [{ code: "comparison_close", title: "Explain price difference" }],
        source_profile_label: "personalized_seller_quote",
      },
      ops: {
        best_pitch_angle: "financing_first_close",
        recommendation_summary: "Leads like this usually close when financing is made simple.",
        recommended_products_json: [{ code: "no_cost_emi" }, { code: "travel_insurance" }],
      },
      intentSignals: {
        first_upload_at: "2026-04-10T09:15:00.000Z",
        contact_captured_at: "2026-04-10T10:00:00.000Z",
      },
    });

    expect(snapshot.conversion_status).toBe("won");
    expect(snapshot.product_converted).toEqual(["no_cost_emi", "travel_insurance"]);
    expect(snapshot.pitch_angle_that_worked).toBe("financing_first_close");
    expect(snapshot.time_from_first_upload_to_conversion_hours).toBeGreaterThan(8);
    expect(snapshot.active_for_learning).toBe(true);
  });

  it("builds ops-facing outcome guidance from aggregate memory", () => {
    const summary = buildOutcomeLearningSummary({
      benchmark: {
        benchmark_key: "international|hanoi|flights_and_hotels|long|pair",
        sample_count: 9,
        won_case_count: 4,
        lost_case_count: 2,
        partial_case_count: 1,
        conversion_rate_weighted: 0.41,
        anonymous_origin_win_rate: 0.12,
        benchmark_confidence_score: 76,
        guidance_summary: "Comparable Vietnam flight+hotel cases are converting when the pitch stays financing-first and clear.",
      },
      pitchRows: [
        {
          pitch_angle: "financing_first_close",
          sample_count: 4,
          won_count: 3,
          lost_count: 1,
          win_rate: 0.68,
        },
      ],
      productRows: [
        {
          product_code: "no_cost_emi",
          sample_count: 3,
          won_count: 2,
          lost_count: 1,
          partial_case_count: 0,
          win_rate: 0.55,
        },
        {
          product_code: "travel_insurance",
          sample_count: 2,
          won_count: 1,
          lost_count: 0,
          partial_case_count: 1,
          win_rate: 0.5,
        },
      ],
    });

    expect(summary.conversion_rate_band).toBe("medium");
    expect(summary.best_pitch_angle).toBe("financing_first_close");
    expect(summary.top_products).toContain("no cost emi");
    expect(summary.anonymous_recovery_signal).toContain("Anonymous uploads");
    expect(summary.guidance_lines.length).toBeGreaterThan(0);
  });
});
