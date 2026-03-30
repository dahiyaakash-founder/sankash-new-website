import SiteLayout from "@/components/SiteLayout";
import SEOHead, { organizationSchema, websiteSchema } from "@/components/SEOHead";
import HomepageHero from "@/components/home/HomepageHero";
import TrustBar from "@/components/home/TrustBar";
import AudienceRouting from "@/components/home/AudienceRouting";
import ThreePillars from "@/components/home/ThreePillars";
import AgentValueProp from "@/components/home/AgentValueProp";
import TravelerTeaser from "@/components/home/TravelerTeaser";
import HomepageCTA from "@/components/home/HomepageCTA";
import AssistantEntryPoint from "@/components/AssistantEntryPoint";

const homepagePrompts = [
  { label: "Review a holiday quote", link: "/for-travelers" },
  { label: "Explore agent solutions", link: "/for-travel-agents" },
  { label: "Find the right solution", link: "/solutions" },
  { label: "Get integration help", link: "/developers" },
  { label: "Book a demo", link: "/contact" },
];

const Index = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="SanKash — Travel EMI, Insurance and Payments Infrastructure"
        description="SanKash helps travel businesses grow with No Cost EMI, embedded insurance, payment collection and travel-focused financial infrastructure."
        jsonLd={[organizationSchema, websiteSchema]}
      />
      <HomepageHero />
      <TrustBar />
      <AudienceRouting />
      <ThreePillars />
      <AgentValueProp />
      <TravelerTeaser />
      <AssistantEntryPoint prompts={homepagePrompts} />
      <HomepageCTA />
    </SiteLayout>
  );
};

export default Index;
