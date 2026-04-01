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
  { label: "Explore agent solutions", link: "/for-travel-agents" },
  { label: "Get integration help", link: "/developers" },
  { label: "Book a demo", link: "/contact?intent=demo" },
];

const Index = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="SanKash — Help Travel Agents Close More Bookings with EMI, Insurance & Payments"
        description="SanKash helps travel agents grow with No Cost EMI at checkout, embedded insurance, quote review tools, and T+1 payment settlement. Join 10,000+ travel partners."
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
