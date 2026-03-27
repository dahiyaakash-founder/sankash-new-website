import SiteLayout from "@/components/SiteLayout";
import HomepageHero from "@/components/home/HomepageHero";
import TrustBar from "@/components/home/TrustBar";
import ThreePillars from "@/components/home/ThreePillars";
import AgentValueProp from "@/components/home/AgentValueProp";
import TravelerTeaser from "@/components/home/TravelerTeaser";
import HomepageCTA from "@/components/home/HomepageCTA";

const Index = () => {
  return (
    <SiteLayout>
      <HomepageHero />
      <TrustBar />
      <ThreePillars />
      <AgentValueProp />
      <TravelerTeaser />
      <HomepageCTA />
    </SiteLayout>
  );
};

export default Index;
