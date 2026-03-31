import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => (
  <SiteLayout>
    <SEOHead title="Privacy Policy | SanKash" description="SanKash privacy policy — how we collect, use, and protect your data." />
    <section className="py-10 md:py-20">
      <div className="container max-w-3xl prose prose-sm dark:prose-invert">
        <h1 className="text-3xl font-heading font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: March 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly — name, email, phone number, company name, and any details submitted through forms on our website. We also collect usage data such as pages visited, browser type, and device information through standard analytics.</p>

        <h2>2. How We Use Your Information</h2>
        <p>Your information is used to respond to enquiries, process demo requests, provide our services, improve our platform, and communicate relevant updates. We do not sell your personal data to third parties.</p>

        <h2>3. Data Sharing</h2>
        <p>We may share information with lending partners, insurance providers, and payment processors solely for the purpose of facilitating the services you request. All partners are bound by data protection agreements.</p>

        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security audits to protect your data.</p>

        <h2>5. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:support@sankash.in">support@sankash.in</a>.</p>

        <h2>6. Cookies</h2>
        <p>We use essential cookies for site functionality and analytics cookies to understand usage patterns. You can manage cookie preferences through your browser settings.</p>

        <h2>7. Contact</h2>
        <p>For privacy-related enquiries, contact us at <a href="mailto:support@sankash.in">support@sankash.in</a>.</p>
      </div>
    </section>
  </SiteLayout>
);

export default PrivacyPolicy;
