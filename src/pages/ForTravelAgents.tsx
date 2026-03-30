import React from "react";
import SiteLayout from "@/components/SiteLayout";
import SEOHead, { createFAQSchema } from "@/components/SEOHead";
import AssistantEntryPoint from "@/components/AssistantEntryPoint";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Search,
  ShieldCheck,
  CreditCard,
  Banknote,
  Lock,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Calculator,
} from "lucide-react";
import ItineraryUploader from "@/components/agents/ItineraryUploader";
import { calculateAllTenures, formatINR } from "@/lib/emi-calculator";
import { AGENT_SIGNUP_URL, AGENT_LOGIN_URL } from "@/lib/constants";

const whyReasons = [
  {
    icon: TrendingUp,
    title: "Higher-value bookings",
    desc: "Customers choose premium packages when EMI is available at checkout.",
  },
  {
    icon: Banknote,
    title: "No Cost EMI at checkout",
    desc: "20% sales lift, 40% better conversion. You get paid upfront.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance at checkout",
    desc: "Embedded travel protection. Ancillary revenue, zero manual work.",
  },
  {
    icon: CreditCard,
    title: "Faster collections",
    desc: "Accept payments, auto-reconcile, settle T+1.",
  },
  {
    icon: Zap,
    title: "No paperwork",
    desc: "Works inside your existing booking workflow.",
  },
];

const optimiserSteps = [
  { num: "01", icon: Upload, label: "Upload a quote", desc: "Share itinerary or package details." },
  { num: "02", icon: Search, label: "Review competitiveness", desc: "Pricing and financing gaps." },
  { num: "03", icon: Banknote, label: "See financing fits", desc: "EMI and coverage options." },
  { num: "04", icon: Lock, label: "Unlock full insights", desc: "Sign in for recommendations." },
];

const beforeSignup = [
  { icon: Upload, label: "Review a quote", desc: "Quick feedback on any itinerary" },
  { icon: Search, label: "Competitiveness signals", desc: "Pricing and financing gaps" },
  { icon: Banknote, label: "Preview EMI options", desc: "See available financing" },
];

const afterSignup = [
  { icon: FileText, label: "Detailed insights", desc: "Pricing, financing, and coverage review" },
  { icon: TrendingUp, label: "Market benchmarks", desc: "Compare against current trends" },
  { icon: Clock, label: "T+1 settlement", desc: "Next-day payouts, auto-reconciled" },
  { icon: Users, label: "Dedicated support", desc: "Relationship manager for your agency" },
];

const pillars = [
  { icon: Banknote, title: "Lending", outcome: "Offer No Cost EMI at checkout. 20% sales lift, 40% better conversion." },
  { icon: ShieldCheck, title: "Insurance", outcome: "Embedded protection at checkout. Ancillary revenue." },
  { icon: CreditCard, title: "Payments", outcome: "Collect faster. Settle T+1. Auto-reconciliation." },
];

// Sample EMI for agent display — ₹85,000 trip
const sampleEmiResults = calculateAllTenures(85000).filter(r => [3, 6, 9, 12, 18, 24].includes(r.tenure));

const agentFaqs = [
  {
    q: "How does No Cost EMI work for travel agents?",
    a: "When a customer books through your agency with SanKash No Cost EMI, the lender pays you the full trip amount upfront. The customer repays the lender in monthly instalments with zero interest. You bear no credit risk and get paid immediately.",
  },
  {
    q: "Does offering EMI slow down the booking process?",
    a: "No. SanKash EMI is embedded into the booking workflow. Customer approval is fully digital and takes minutes — no paperwork, no branch visits, no delays to your booking confirmation.",
  },
  {
    q: "What does it cost the travel agent to offer SanKash?",
    a: "There is no upfront cost to the travel agent. SanKash works on a transaction-based model. You earn more by converting more bookings and upselling premium packages through EMI availability.",
  },
  {
    q: "Can I offer travel insurance through SanKash too?",
    a: "Yes. SanKash provides embedded travel insurance at the point of booking — covering trip cancellation, medical emergencies, and baggage. You earn ancillary revenue on every policy sold, with zero manual work.",
  },
];

const ForTravelAgents = () => {
  const uploaderRef = React.useRef<HTMLDivElement>(null);

  const scrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <SiteLayout>
      <SEOHead
        title="For Travel Agents — No Cost EMI, Insurance and Faster Collections | SanKash"
        description="Help customers book with No Cost EMI, add travel protection and collect payments faster with SanKash for travel agents."
        jsonLd={createFAQSchema(agentFaqs)}
      />
      {/* Hero — compact decision block */}
      <section className="bg-hero-gradient py-10 md:py-14">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 lg:pt-2"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                For Travel Agents & Businesses
              </p>
              <h1 className="text-[1.75rem] sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-tight text-foreground">
                Review your itinerary
                <br />
                <span className="text-gradient-brand">before you send it.</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
                Upload a quote and get a quick review of financing, protection,
                and collection opportunities — before your customer sees it.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Button size="xl" className="gap-2 w-full sm:w-auto" onClick={scrollToUploader}>
                  Upload a Quote <ArrowRight size={18} />
                </Button>
                <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Agent Login
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              ref={uploaderRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ItineraryUploader />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why agents use SanKash */}
      <section className="py-10 md:py-14">
        <div className="container">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
              Sell smarter. Close more bookings.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyReasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="p-4 sm:p-5 rounded-2xl border bg-card hover:shadow-card transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
                  <r.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1 text-sm">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EMI & Sales Tool — agent-specific */}
      <section className="py-10 md:py-14 bg-section-alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                EMI & Sales Tool
              </p>
              <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
                Check EMI for your customer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Show your customer what their trip could cost per month. Use SanKash's indicative EMI calculator to present 3, 6, 9, 12, 18, and 24‑month options during the sales conversation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/emi-calculator">
                  <Button size="lg" className="gap-2">
                    <Calculator size={16} /> Open EMI Calculator
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="gap-2" onClick={scrollToUploader}>
                  Upload a Quote
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-card rounded-2xl border shadow-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <CreditCard size={14} className="text-primary" />
                  Indicative EMI · ₹85,000 trip
                </div>
                <div className="space-y-2">
                  {sampleEmiResults.map((emi) => (
                    <div
                      key={emi.tenure}
                      className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/50"
                    >
                      <div>
                        <p className="font-heading font-bold text-foreground text-sm">
                          {formatINR(emi.monthlyEmi)}
                          <span className="text-muted-foreground font-normal text-xs"> /month</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">{emi.tenure} months</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        emi.emiType === "no_cost" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {emi.emiType === "no_cost" ? "No Cost EMI" : "Standard EMI"}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Indicative amounts only. Final offers depend on lender approval, trip value, customer profile, and applicable fees.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three pillars — compact product summary */}
      <section className="py-8 md:py-10 border-t border-b">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-start gap-3 p-4"
              >
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <p.icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.outcome}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Review your itinerary — dark section */}
      <section className="py-8 md:py-12 bg-brand-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight text-primary-foreground">
              How quote review works
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/50 max-w-md mx-auto">
              Upload a customer quote. Get actionable feedback in minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
            {optimiserSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="relative p-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 text-center"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center mx-auto mb-1.5">
                  <step.icon size={16} className="text-primary-foreground/70" />
                </div>
                <h3 className="font-heading font-bold text-primary-foreground text-xs mb-0.5">{step.label}</h3>
                <p className="text-[11px] text-primary-foreground/40 leading-snug">{step.desc}</p>
                {i < optimiserSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-1.5 w-3 h-px bg-primary-foreground/15" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Button size="lg" className="gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90" onClick={scrollToUploader}>
              Upload a Quote <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* What opens up after signup */}
      <section className="py-10 md:py-14 bg-section-alt">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
              What opens up after signup
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
              Start with a free quote review. Unlock deeper tools after onboarding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-4 sm:p-5 rounded-2xl border bg-card"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Try now</p>
              <div className="space-y-3">
                {beforeSignup.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={14} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-bold text-foreground">{item.label}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-4 sm:p-5 rounded-2xl border bg-card"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lock size={11} className="text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Partners unlock</p>
              </div>
              <div className="space-y-3">
                {afterSignup.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={14} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-bold text-foreground">{item.label}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-10 md:py-14 bg-section-alt">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {agentFaqs.map((faq) => (
              <details key={faq.q} className="group bg-card rounded-xl border p-3.5 cursor-pointer">
                <summary className="flex items-center justify-between font-heading font-bold text-sm text-foreground list-none">
                  {faq.q}
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2.5 pr-6">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Assistant — compact utility */}
      <AssistantEntryPoint
        className="py-6 md:py-8"
        prompts={[
          { label: "Start agent onboarding", href: AGENT_SIGNUP_URL },
          { label: "See how it works", link: "/solutions" },
          { label: "EMI Calculator", link: "/emi-calculator" },
        ]}
      />

      {/* Final CTA */}
      <section className="py-10 md:py-14 bg-brand-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative max-w-3xl text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground tracking-tight">
            Your next booking starts here.
          </h2>
          <p className="text-sm text-primary-foreground/50 max-w-md mx-auto">
            Join 8,000+ travel partners using SanKash to grow revenue and collect faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
            <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="xl" className="gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90 w-full sm:w-auto">
                Agent Signup <ArrowRight size={18} />
              </Button>
            </a>
            <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="ghost-dark" size="xl" className="w-full sm:w-auto">
                Agent Login
              </Button>
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForTravelAgents;
