import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Shield, Lock, Server, Eye } from "lucide-react";

const practices = [
  { icon: Lock, title: "Encryption", desc: "All data is encrypted in transit (TLS 1.3) and at rest. Sensitive credentials are stored in secure vaults with zero plain-text exposure." },
  { icon: Server, title: "Infrastructure", desc: "Hosted on enterprise-grade cloud infrastructure with automatic failover, regular backups, and 99.9% uptime SLA." },
  { icon: Eye, title: "Access Controls", desc: "Role-based access control across all systems. Multi-factor authentication required for all administrative access." },
  { icon: Shield, title: "Compliance", desc: "We follow industry-standard security practices and conduct regular vulnerability assessments and penetration testing." },
];

const Security = () => (
  <SiteLayout>
    <SEOHead title="Security | SanKash" description="How SanKash protects your data with enterprise-grade security practices." />
    <section className="bg-hero-gradient py-10 md:py-20">
      <div className="container max-w-3xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Shield size={28} className="text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold">Security at SanKash</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Protecting your data is fundamental to our platform. Here's how we keep your information safe.
        </p>
      </div>
    </section>

    <section className="py-10 md:py-20">
      <div className="container max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-5">
          {practices.map((p) => (
            <div key={p.title} className="p-5 rounded-2xl border bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <p.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl border bg-accent/30 text-center space-y-3">
          <h3 className="font-heading font-bold">Report a Vulnerability</h3>
          <p className="text-sm text-muted-foreground">
            If you discover a security vulnerability, please report it responsibly to{" "}
            <a href="mailto:security@sankash.in" className="text-primary font-medium">security@sankash.in</a>.
          </p>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default Security;
