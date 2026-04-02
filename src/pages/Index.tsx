import SiteLayout from "@/components/SiteLayout";
import SEOHead, { organizationSchema, websiteSchema } from "@/components/SEOHead";
import HomepageHero from "@/components/home/HomepageHero";
import TrustBar from "@/components/home/TrustBar";
import AgentToolkit from "@/components/home/AgentToolkit";
import AgentValueProp from "@/components/home/AgentValueProp";
import SecondaryPaths from "@/components/home/SecondaryPaths";
import HomepageCTA from "@/components/home/HomepageCTA";
import AssistantEntryPoint from "@/components/AssistantEntryPoint";

const homepagePrompts = [
  { label: "Upload a holiday quote", link: "/for-travel-agents" },
  { label: "Open EMI calculator", link: "/emi-calculator" },
  { label: "Get integration help", link: "/developers" },
];

const Index = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="SanKash — Travel Fintech Platform for Payments, Protection & Financing"
        description="SanKash is a travel fintech platform enabling payments, protection, financing, and customer servicing for travel businesses and travelers across the booking journey."
        jsonLd={[organizationSchema, websiteSchema]}
      />
      <HomepageHero />
      <TrustBar />
      <AgentToolkit />
      <AgentValueProp />
      <SecondaryPaths />
      <AssistantEntryPoint prompts={homepagePrompts} />
      <HomepageCTA />
    </SiteLayout>
  );
};

export default Index;
