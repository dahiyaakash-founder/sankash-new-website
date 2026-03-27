import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CreditCard, Banknote, Lock, BookOpen, Terminal, CheckCircle2 } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.45 },
};

const gettingStartedSteps = [
  { num: "01", label: "Explore the docs", desc: "Browse the full API reference, request and response examples, and integration guides — no account needed." },
  { num: "02", label: "Get sandbox credentials", desc: "Sign up for test credentials instantly. Use them to explore endpoints in a safe sandbox environment." },
  { num: "03", label: "Build and test", desc: "Integrate SanKash APIs into your platform using sandbox mode. Test quotes, payments, and workflows with sample data." },
  { num: "04", label: "Request production approval", desc: "When you're ready, request production credentials. Our team reviews and approves within 2 business days." },
];

const lendingEndpoints = [
  "No Cost EMI enablement",
  "Finance eligibility and pre-qualification",
  "Checkout-linked lending flow",
  "Hosted or integrated options by use case",
];

const insuranceEndpoints = [
  "Quote generation and plan selection",
  "Traveler details submission",
  "Policy issuance and confirmation",
  "Booking-linked protection workflows",
];

const paymentsEndpoints = [
  "Payment collection and checkout flows",
  "Payment link generation",
  "Settlement tracking and status",
  "Reconciliation and reporting",
];

const Developers = () => {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">API & Integrations</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-primary-deep leading-tight">
              Integrate SanKash in days, not months
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Simple APIs for travel insurance and payments, built for real travel workflows.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="xl">Get Sandbox Access</Button>
              <Link to="/contact">
                <Button variant="outline" size="xl">Request Production Access</Button>
              </Link>
              <Button variant="ghost" size="xl" className="gap-2">
                <BookOpen size={18} /> View Docs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fade} className="max-w-2xl mb-14">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em] mb-3">Getting started</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              Four steps to go live
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gettingStartedSteps.map((step, i) => (
              <motion.div key={step.num} {...fade} transition={{ delay: i * 0.08, duration: 0.4 }} className="relative">
                <div className="bg-card border rounded-xl p-6 shadow-card h-full">
                  <span className="text-3xl font-heading font-bold text-primary/15">{step.num}</span>
                  <h3 className="text-base font-heading font-bold text-primary-deep mt-2">{step.label}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                </div>
                {i < gettingStartedSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                    <ArrowRight size={14} className="text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container">
          <motion.div {...fade} className="max-w-2xl mb-14">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em] mb-3">API overview</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              Two APIs, built for travel
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Everything you need to embed insurance and payment capabilities into your travel platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Insurance API */}
            <motion.div {...fade} transition={{ delay: 0, duration: 0.45 }} className="rounded-2xl border bg-card p-8 md:p-10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-primary-deep">Travel Insurance API</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Programmatically offer travel protection at the point of booking. Generate quotes, collect traveler details, and issue policies — all linked to the booking workflow.
              </p>
              <ul className="space-y-2.5">
                {insuranceEndpoints.map((ep) => (
                  <li key={ep} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                    {ep}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Payments API */}
            <motion.div {...fade} transition={{ delay: 0.08, duration: 0.45 }} className="rounded-2xl border bg-card p-8 md:p-10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <CreditCard size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-primary-deep">Payments API</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Collect payments, generate payment links, and manage settlements. Built for travel's multi-party settlement complexity.
              </p>
              <ul className="space-y-2.5">
                {paymentsEndpoints.map((ep) => (
                  <li key={ep} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                    {ep}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-20 md:py-28">
        <div className="container max-w-3xl">
          <motion.div {...fade} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Lock size={20} className="text-primary" />
              </div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">Authentication</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary-deep">
              Basic Authentication
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All SanKash API requests use Basic Authentication with a <strong className="text-foreground">KEY ID</strong> and <strong className="text-foreground">KEY SECRET</strong>. Sandbox credentials are available immediately when you sign up. Production credentials are shared privately after your integration is reviewed and approved.
            </p>
            <div className="bg-muted rounded-xl p-6 border">
              <pre className="text-sm font-mono text-foreground leading-relaxed overflow-x-auto">
{`Authorization: Basic {base64(KEY_ID:KEY_SECRET)}

# Example request
curl -X POST https://api.sankash.in/v1/insurance/quote \\
  -H "Authorization: Basic {credentials}" \\
  -H "Content-Type: application/json" \\
  -d '{"trip_value": 85000, "destination": "Thailand"}'`}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              Credentials are never shared publicly. Contact us to request access for your platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Docs & Sandbox */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container max-w-3xl">
          <motion.div {...fade} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Terminal size={20} className="text-primary" />
              </div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">Docs & sandbox</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary-deep">
              Everything you need to build
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Full API documentation, sandbox environment for testing, and integration support from our team.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {[
                { label: "Documentation", desc: "Complete API reference with request and response examples" },
                { label: "Sandbox access", desc: "Test your integration safely before going live" },
                { label: "Integration help", desc: "Our team supports you from first API call to production" },
              ].map((item) => (
                <div key={item.label} className="bg-card border rounded-xl p-5 shadow-card">
                  <h3 className="text-sm font-heading font-bold text-primary-deep">{item.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-brand-deep text-primary-foreground">
        <motion.div {...fade} className="container max-w-2xl text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Need API access for your travel platform?
          </h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            Request access and our team will help you get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" variant="secondary">Get Sandbox Access</Button>
            <Button size="lg" variant="ghost-dark" asChild>
              <Link to="/contact">Request Production Access</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
};

export default Developers;
