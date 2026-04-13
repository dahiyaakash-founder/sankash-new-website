import { describe, expect, it } from "vitest";
import { BUILD_TRIP_DEFAULTS, buildInspirationInputsFromText, buildTripEngine } from "@/lib/build-my-trip";

describe("build-my-trip engine", () => {
  it("keeps weak link-only inspiration useful with a next-step prompt", () => {
    const brief = {
      ...BUILD_TRIP_DEFAULTS,
      start_mode: "inspiration_dump" as const,
      entry_mode: "shortlisting_a_few_places" as const,
      inspiration_dump_text: "https://www.instagram.com/reel/C9travelidea123/",
    };

    const engine = buildTripEngine({ brief });

    expect(engine.signals.input_strength).toBe("weak");
    expect(engine.render_contract.state).toBe("guided_question");
    expect(engine.clarifying_questions.length).toBeGreaterThan(0);
    expect(engine.synthesis.next_clarification_prompt).toBeTruthy();
    expect(engine.synthesis.trip_direction.toLowerCase()).not.toContain("bali");
  });

  it("turns text-only couple trip inspiration into a meaningful trip direction", () => {
    const brief = {
      ...BUILD_TRIP_DEFAULTS,
      start_mode: "inspiration_dump" as const,
      entry_mode: "shortlisting_a_few_places" as const,
      inspiration_dump_text: "want honeymoon vibe but manageable budget and a sunset resort",
    };

    const engine = buildTripEngine({ brief });

    expect(engine.signals.input_strength).toBe("medium");
    expect(engine.render_contract.state).toBe("trip_direction");
    expect(engine.signals.vibe_signals).toContain("romantic");
    expect(engine.synthesis.trip_direction.toLowerCase()).toContain("romantic");
    expect(engine.synthesis.next_clarification_prompt).toBeTruthy();
  });

  it("extracts destination signals from inspiration dumps with multiple items", () => {
    const brief = {
      ...BUILD_TRIP_DEFAULTS,
      start_mode: "inspiration_dump" as const,
      entry_mode: "shortlisting_a_few_places" as const,
      inspiration_dump_text: [
        "my friend suggested Phi Phi",
        "want a beach resort with sunset views",
        "https://example.com/phuket-beach-resort-guide",
      ].join("\n"),
      approximate_budget_band: "1l_2l",
      budget_for_count: "2",
      domestic_or_international: "international",
      tentative_month_or_dates: "November",
      departure_city: "Delhi",
    };

    const engine = buildTripEngine({
      brief,
      inspirationInputs: buildInspirationInputsFromText(brief.inspiration_dump_text),
    });

    expect(engine.signals.input_strength).toBe("strong");
    expect(engine.render_contract.state).toBe("structured_recommendation");
    expect(engine.synthesis.destination_shortlist.length).toBeGreaterThan(0);
    expect(
      engine.synthesis.destination_shortlist.some((destination) =>
        ["Thailand", "Phuket", "Krabi"].includes(destination),
      ),
    ).toBe(true);
    expect(engine.synthesis.bookable_read.status).not.toBe("insufficient_trip_structure");
  });

  it("asks for travel month before pushing contact-style fallback when timing is missing", () => {
    const brief = {
      ...BUILD_TRIP_DEFAULTS,
      start_mode: "known_destination" as const,
      entry_mode: "yes" as const,
      destination_in_mind: "Santorini",
      traveler_mix: "couple",
      approximate_budget_band: "2l_5l",
      budget_for_count: "2",
      domestic_or_international: "international",
      departure_city: "Delhi",
      priorities: ["better_hotel"],
    };

    const engine = buildTripEngine({ brief });

    expect(engine.clarifying_questions.some((question) => question.code === "travel_month")).toBe(true);
    expect(engine.synthesis.next_clarification_prompt?.toLowerCase()).toContain("when");
  });

  it("returns versions and finance direction for strong structured input", () => {
    const brief = {
      ...BUILD_TRIP_DEFAULTS,
      start_mode: "known_destination" as const,
      entry_mode: "yes" as const,
      destination_in_mind: "Phuket",
      traveler_mix: "couple",
      trip_type: "couple",
      approximate_budget_band: "2l_5l",
      budget_for_count: "2",
      domestic_or_international: "international",
      tentative_month_or_dates: "December",
      departure_city: "Delhi",
      trip_duration: "5 nights",
      priorities: ["easy_payment", "better_hotel"],
    };

    const engine = buildTripEngine({ brief });

    expect(engine.signals.input_strength).toBe("strong");
    expect(engine.render_contract.state).toBe("structured_recommendation");
    expect(engine.synthesis.realistic_version).toBeTruthy();
    expect(engine.synthesis.upgraded_version).toBeTruthy();
    expect(engine.synthesis.finance_read.no_cost_emi_relevant).toBe(true);
  });
});
