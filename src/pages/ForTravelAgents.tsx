import React from "react";
import SiteLayout from "@/components/SiteLayout";
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
    title: "Close higher-value bookings",
    desc: "When customers can pay in installments, they book premium packages instead of downgrading. Your average ticket size goes up.",
  },
  {
    icon: Banknote,
    title: "Offer No Cost EMI at point of sale",
    desc: "Instant EMI approval with 15+ lending partners. Customers choose their tenure, you get paid upfront.",
  },
  {
    icon: ShieldCheck,
    title: "Attach protection to every booking",
    desc: "Embed travel insurance at checkout. Earn ancillary revenue on every relevant trip without extra effort.",
  },
  {
    icon: CreditCard,
    title: "Collect payments through SanKash",
    desc: "Accept customer payments with built-in reconciliation. Track collections in one place, settle T+1.",
  },
  {
    icon: Zap,
    title: "Reduce friction in your selling flow",
    desc: "No paperwork, no separate finance applications. Everything happens inside the booking workflow your customers already use.",
  },
];

const optimiserSteps = [
  { num: "01", icon: Upload, label: "Upload your quote", desc: "Share an itinerary, quote, or package details." },
  { num: "02", icon: Search, label: "Check competitiveness", desc: "See where pricing, financing, or protection can improve." },
  { num: "03", icon: Banknote, label: "See financing & protection fits", desc: "Understand what EMI and coverage options work for the trip." },
  { num: "04", icon: Lock, label: "Unlock full insights", desc: "Sign in or register for detailed recommendations." },
];

const pillars = [
  {
    icon: Banknote,
    title: "Lending",
    hook: "Help customers afford the trip",
    points: [
      "No Cost EMI and low-cost EMI options",
      "Instant approval — 15+ lending partners",
      "Higher conversion on premium packages",
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
      "Ancillary revenue stream for your business",
      "Automated policy issuance — no manual work",
    ],
  },
  {
    icon: CreditCard,
    title: "Payments",
    hook: "Collect faster, settle sooner",
    points: [
      "Accept customer payments through SanKash",
      "T+1 settlement cycle — no delays",
      "Auto-reconciliation and payment tracking",
      "Reduce follow-ups and collection friction",
    ],
  },
];

const onboardingSteps = [
  { num: "1", title: "Sign up as a partner", desc: "Quick registration — no technical setup required." },
  { num: "2", title: "Upload a customer quote", desc: "Run the review tool on a real itinerary." },
  { num: "3", title: "Turn on EMI & insurance", desc: "Offer financing and protection on your bookings." },
  { num: "4", title: "Collect payments via SanKash", desc: "Accept payments with built-in settlement tracking." },
];

const ForTravelAgents = () => {
  const uploaderRef = React.useRef<HTMLDivElement>(null);

  const scrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-hero-gradient py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-5 lg:pt-4"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                For Travel Agents & Businesses
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight text-foreground">
                Review your itinerary
                <br />
                <span className="text-gradient-brand">before you send it.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Upload a quote and get a quick review of financing, protection,
                and collection opportunities — before your customer sees it.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button size="xl" className="gap-2" onClick={scrollToUploader}>
                  Upload a Quote <ArrowRight size={18} />
                </Button>
                <Button variant="outline" size="xl">
                  Agent Login
                </Button>
              </div>
            </motion.div>

            {/* Right side: Interactive uploader */}
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
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Why Travel Agents Choose SanKash</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              Sell smarter. Close more bookings.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyReasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-6 rounded-2xl border bg-card hover:shadow-card transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <r.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary Optimiser */}
      <section className="py-20 md:py-28 bg-brand-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-[11px] font-semibold text-primary-foreground/50 uppercase tracking-[0.1em] mb-3">
              Agent-Only Feature
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-foreground">
              Review your itinerary
            </h2>
            <p className="mt-4 text-primary-foreground/50 leading-relaxed max-w-lg mx-auto">
              Upload a customer quote and understand how to make it more competitive — 
              with financing, protection, and sourcing signals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {optimiserSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative p-5 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 text-center"
              >
                <div className="text-[10px] font-semibold text-primary-foreground/30 uppercase tracking-widest mb-3">
                  Step {step.num}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center mx-auto mb-3">
                  <step.icon size={20} className="text-primary-foreground/70" />
                </div>
                <h3 className="font-heading font-bold text-primary-foreground text-sm mb-1">{step.label}</h3>
                <p className="text-xs text-primary-foreground/40 leading-relaxed">{step.desc}</p>
                {i < optimiserSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-primary-foreground/15" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" className="gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90">
              Review an Itinerary <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Three Growth Pillars */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              Three pillars of agent growth
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Lending, Insurance, and Payments — integrated into your booking workflow.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-7 rounded-2xl border bg-card"
              >
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5">
                  <p.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-primary font-medium mb-4">{p.hook}</p>
                <ul className="space-y-2.5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 size={15} className="text-brand-green shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gated Partner Tools */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1">
                <Lock size={12} className="text-primary" />
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Partner Access</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Deeper tools for registered partners
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                SanKash partners get access to advanced analytics, detailed itinerary insights,
                priority settlement, and dedicated support. These tools are designed for agents
                who want to grow systematically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { icon: TrendingUp, label: "Booking Analytics", desc: "Track conversion, revenue, and customer trends" },
                { icon: FileText, label: "Itinerary Insights", desc: "Detailed competitiveness analysis per quote" },
                { icon: Clock, label: "Priority Settlement", desc: "Faster payouts with auto-reconciliation" },
                { icon: Users, label: "Dedicated Support", desc: "Assigned relationship manager for your business" },
              ].map((tool) => (
                <div
                  key={tool.label}
                  className="p-5 rounded-xl border bg-card"
                >
                  <tool.icon size={20} className="text-primary mb-3" />
                  <h4 className="font-heading font-bold text-sm text-foreground mb-1">{tool.label}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              Get started in minutes
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              No heavy integration needed. Start using SanKash with your existing workflow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {onboardingSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-heading font-bold text-sm">
                  {step.num}
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-brand-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground tracking-tight">
            Ready to sell smarter?
          </h2>
          <p className="text-primary-foreground/50 text-lg leading-relaxed max-w-lg mx-auto">
            Join 8,000+ travel partners already using SanKash to close more bookings,
            earn more per trip, and collect faster.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
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
