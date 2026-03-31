import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";

const TermsOfService = () => (
  <SiteLayout>
    <SEOHead title="Terms of Service | SanKash" description="SanKash terms of service governing use of our platform and services." />
    <section className="py-10 md:py-20">
      <div className="container max-w-3xl prose prose-sm dark:prose-invert">
        <h1 className="text-3xl font-heading font-bold">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last updated: March 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the SanKash platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

        <h2>2. Services</h2>
        <p>SanKash provides travel financial infrastructure including EMI facilitation, travel insurance distribution, and payment processing for travel businesses. All EMI options, interest rates, and terms displayed are indicative and subject to lender approval.</p>

        <h2>3. Eligibility</h2>
        <p>You must be at least 18 years of age and a resident of India to use our services. Travel agents must hold valid business registrations where applicable.</p>

        <h2>4. No Cost EMI</h2>
        <p>No Cost EMI is subject to customer eligibility, lender approval, and applicable partner criteria. Processing fees may apply. SanKash facilitates — final lending decisions are made by partner financial institutions.</p>

        <h2>5. Limitation of Liability</h2>
        <p>SanKash acts as a facilitator and is not a lender or insurer. We are not liable for decisions made by lending partners, insurance providers, or payment processors. All financial products are subject to respective provider terms.</p>

        <h2>6. Intellectual Property</h2>
        <p>All content, branding, and technology on the SanKash platform are owned by SanKash. Unauthorized reproduction or distribution is prohibited.</p>

        <h2>7. Governing Law</h2>
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Gurugram, Haryana.</p>

        <h2>8. Contact</h2>
        <p>For questions about these terms, contact us at <a href="mailto:support@sankash.in">support@sankash.in</a>.</p>
      </div>
    </section>
  </SiteLayout>
);

export default TermsOfService;
