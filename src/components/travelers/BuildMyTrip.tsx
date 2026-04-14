import TravelerBuildTripFlow from "@/components/travelers/TravelerBuildTripFlow";

function scrollToTarget(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function BuildMyTrip() {
  return (
    <TravelerBuildTripFlow
      onGoToQuoteReview={() => scrollToTarget("quote-upload-section")}
      onGoToEmi={() => scrollToTarget("emi-section")}
    />
  );
}
