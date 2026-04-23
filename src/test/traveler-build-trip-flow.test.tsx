import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TravelerBuildTripFlow from "@/components/travelers/TravelerBuildTripFlow";

function moveIntoInspirationDump(text: string) {
  render(
    <TravelerBuildTripFlow
      onGoToQuoteReview={() => {}}
      onGoToEmi={() => {}}
    />,
  );

  fireEvent.click(screen.getByText("Inspiration dump"));
  fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
  fireEvent.change(screen.getByPlaceholderText(/One line each works best/i), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));
}

describe("TravelerBuildTripFlow", () => {
  it("lets weak inspiration reach the first useful question without forcing all optional details", () => {
    moveIntoInspirationDump("https://www.instagram.com/reel/C9travelidea123/");

    fireEvent.click(screen.getByRole("button", { name: /See next useful question/i }));

    expect(screen.getByText("Our read of what you shared")).toBeInTheDocument();
    expect(screen.getByText("Next useful detail")).toBeInTheDocument();
    expect(
      screen.getAllByText(/When are you roughly hoping to travel|What kind of trip is this starting to look like/i).length,
    ).toBeGreaterThan(0);
  });

  it("shows medium-strength shaping output before any save flow", () => {
    moveIntoInspirationDump("want honeymoon vibe but manageable budget and a sunset resort");

    fireEvent.click(screen.getByRole("button", { name: /See trip direction/i }));

    expect(screen.getByText("Our read of what you shared")).toBeInTheDocument();
    expect(screen.getByText("Trip direction")).toBeInTheDocument();
    expect(screen.getAllByText(/romantic/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Bookable read")).toBeInTheDocument();
  });
});
