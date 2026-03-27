import React from "react";
import SiteLayout from "@/components/SiteLayout";
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
  CheckCircle2,
  Lock,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Clock,
} from "lucide-react";
import ItineraryUploader from "@/components/agents/ItineraryUploader";

const whyReasons = [
  {
    icon: TrendingUp,
    title: "Higher-value bookings",
    desc: "Customers book premium packages when they can pay in installments.",
  },
  {
    icon: Banknote,
    title: "No Cost EMI at point of sale",
    desc: "Instant approval with 15+ lending partners. You get paid upfront.",
  },
  {
    icon: ShieldCheck,
    title: "Protection on every booking",
    desc: "Embed travel insurance at checkout. Earn ancillary revenue effortlessly.",
  },
  {
    icon: CreditCard,
    title: "Payments with built-in reconciliation",
    desc: "Accept payments, track collections, settle T+1.",
  },
  {
    icon: Zap,
    title: "No paperwork, no friction",
    desc: "Everything happens inside your existing booking workflow.",
  },
];

const optimiserSteps = [
  { num: "01", icon: Upload, label: "Upload your quote", desc: "Share an itinerary or package details." },
  { num: "02", icon: Search, label: "Check competitiveness", desc: "See where pricing or financing can improve." },
  { num: "03", icon: Banknote, label: "Financing & protection fits", desc: "EMI and coverage options for the trip." },
  { num: "04", icon: Lock, label: "Unlock full insights", desc: "Sign in for detailed recommendations." },
];

const beforeSignup = [
  { icon: Upload, label: "Upload and review a quote", desc: "Get quick feedback on any itinerary" },
  { icon: Search, label: "See competitiveness signals", desc: "Understand pricing and financing gaps" },
  { icon: Banknote, label: "Preview EMI options", desc: "See what financing could look like" },
];

const afterSignup = [
  { icon: FileText, label: "Itinerary Insights", desc: "Detailed review of pricing, financing, and coverage" },
  { icon: TrendingUp, label: "Quote Competitiveness", desc: "Benchmark packages against market trends" },
  { icon: Clock, label: "Priority Settlement", desc: "T+1 payouts with automatic reconciliation" },
  { icon: Users, label: "Partner Support", desc: "Dedicated relationship manager for your agency" },
];

const pillars = [
  {
    icon: Banknote,
    title: "Lending",
    hook: "Help customers afford the trip",
    points: [
      "No Cost EMI and low-cost EMI options",
      "Instant approval — 15+ lending partners",
      "You get paid upfront, customer pays over time",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Insurance",
    hook: "Earn on every relevant booking",
    points: [
      "Embedded travel protection at checkout",
      "Trip cancellation, medical, and baggage cover",
      "Ancillary revenue — no manual work",
    ],
  },
  {
    icon: CreditCard,
    title: "Payments",
    hook: "Collect faster, settle sooner",
    points: [
      "Accept payments through SanKash",
      "T+1 settlement — auto-reconciliation",
      "Reduce follow-ups and collection friction",
    ],
  },
];

const ForTravelAgents = () => {
  const uploaderRef = React.useRef<HTMLDivElement>(null);

  const scrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <SiteLayout>
      {/* Hero — compact decision block */}
      <section className="bg-hero-gradient py-10 md:py-16">
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-tight text-foreground">
                Review your itinerary
                <br />
                <span className="text-gradient-brand">before you send it.</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
                Upload a quote and get a quick review of financing, protection,
                and collection opportunities — before your customer sees it.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="xl" className="gap-2" onClick={scrollToUploader}>
                  Upload a Quote <ArrowRight size={18} />
                </Button>
                <Button variant="outline" size="xl">
                  Agent Login
                </Button>
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
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Why Travel Agents Choose SanKash</p>
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
                className="p-5 rounded-2xl border bg-card hover:shadow-card transition-shadow"
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

      {/* Review your itinerary — dark section, compressed */}
      <section className="py-12 md:py-16 bg-brand-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="text-[11px] font-semibold text-primary-foreground/50 uppercase tracking-[0.1em] mb-2">
              Agent-Only Feature
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary-foreground">
              Review your itinerary
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/50 leading-relaxed max-w-lg mx-auto">
              Upload a customer quote and understand how to make it more competitive.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {optimiserSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="relative p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 text-center"
              >
                <div className="text-[10px] font-semibold text-primary-foreground/30 uppercase tracking-widest mb-2">
                  Step {step.num}
                </div>
                <div className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center mx-auto mb-2">
                  <step.icon size={18} className="text-primary-foreground/70" />
                </div>
                <h3 className="font-heading font-bold text-primary-foreground text-xs mb-1">{step.label}</h3>
                <p className="text-[11px] text-primary-foreground/40 leading-relaxed">{step.desc}</p>
                {i < optimiserSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-primary-foreground/15" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90" onClick={scrollToUploader}>
              Upload a Quote <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Three Growth Pillars */}
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
              Three pillars of agent growth
            </h2>
            <p className="mt-3 text-muted-foreground">
              Lending, Insurance, and Payments — integrated into your booking workflow.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="p-6 rounded-2xl border bg-card"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <p.icon size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-primary font-medium mb-3">{p.hook}</p>
                <ul className="space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={14} className="text-brand-green shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Merged: What opens up after signup */}
      <section className="py-14 md:py-20 bg-section-alt">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
              What opens up after signup
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Start with a free quote review. After onboarding, unlock deeper insights, faster settlement, and dedicated support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Before signup */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-2xl border bg-card"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">What you can try now</p>
              <div className="space-y-4">
                {beforeSignup.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-bold text-foreground">{item.label}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* After signup */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-6 rounded-2xl border bg-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lock size={12} className="text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">What partners unlock</p>
              </div>
              <div className="space-y-4">
                {afterSignup.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={16} className="text-primary" />
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

      {/* Assistant — compact utility */}
      <AssistantEntryPoint
        className="py-8 md:py-10"
        prompts={[
          { label: "Ask about agent onboarding", link: "/for-travel-agents" },
          { label: "Check if SanKash fits my business", link: "/solutions" },
          { label: "Understand EMI, insurance, and payments", link: "/solutions" },
        ]}
      />

      {/* Final CTA — crisp closing */}
      <section className="py-14 md:py-18 bg-brand-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative max-w-3xl text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground tracking-tight">
            Your next booking starts here.
          </h2>
          <p className="text-primary-foreground/50 leading-relaxed max-w-lg mx-auto">
            Join 8,000+ travel partners already using SanKash to close more bookings
            and collect faster.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link to="/contact">
              <Button size="xl" className="gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90">
                Get Started <ArrowRight size={18} />
              </Button>
            </Link>
            <Button variant="ghost-dark" size="xl">
              Agent Login
            </Button>
            <Link to="/contact">
              <Button variant="ghost-dark" size="xl">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForTravelAgents;
