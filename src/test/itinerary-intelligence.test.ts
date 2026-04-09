import { describe, expect, it } from "vitest";
import { deriveItineraryIntelligence } from "@/lib/itinerary-intelligence";
import { itineraryEvaluationCorpus } from "@/test/itinerary-evaluation-corpus";

describe("itinerary intelligence corpus", () => {
  for (const testCase of itineraryEvaluationCorpus) {
    it(`derives stable intelligence for ${testCase.id}`, () => {
      const actual = deriveItineraryIntelligence(testCase.parsed_input);

      expect(actual.package_mode).toBe(testCase.expected_package_mode);

      for (const [field, expectedValue] of Object.entries(testCase.expected_extracted_fields)) {
        expect((testCase.parsed_input as Record<string, unknown>)[field]).toEqual(expectedValue);
      }

      for (const field of testCase.expected_null_fields) {
        expect((testCase.parsed_input as Record<string, unknown>)[field] ?? null).toBeNull();
      }

      const advisoryCodes = actual.advisory_insights_json.map((item) => item.code);
      const travelerQuestionCodes = actual.traveler_questions_json.map((item) => item.code);
      const sellerQuestionCodes = actual.seller_questions_json.map((item) => item.code);
      const nextInputCodes = actual.next_inputs_needed_json.map((item) => item.code);
      const unlockableCodes = actual.unlockable_modules_json.map((item) => item.code);

      for (const code of testCase.expected_advisory_codes) {
        expect(advisoryCodes).toContain(code);
      }

      for (const code of testCase.expected_traveler_question_codes) {
        expect(travelerQuestionCodes).toContain(code);
      }

      for (const code of testCase.expected_seller_question_codes) {
        expect(sellerQuestionCodes).toContain(code);
      }

      for (const code of testCase.expected_next_input_codes) {
        expect(nextInputCodes).toContain(code);
      }

      for (const code of testCase.expected_unlockable_modules) {
        expect(unlockableCodes).toContain(code);
      }

      expect(actual.extracted_completeness_score).toBeGreaterThanOrEqual(0);
      expect(actual.extracted_completeness_score).toBeLessThanOrEqual(100);
      expect(actual.enrichment_status_json.advisory_version).toBeTruthy();
      expect(actual.enrichment_status_json.next_best_action.code).toBeTruthy();
    });
  }
});
