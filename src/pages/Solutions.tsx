import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, ShieldCheck, CreditCard, ArrowRight, CheckCircle2, Users, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Banknote,
    label: "Lending",
    title: "Offer No Cost EMI at checkout",
    desc: "Help customers book holidays in monthly instalments without changing the booking flow. Higher ticket sizes, stronger conversion, and more customer queries.",
    points: [
      "No Cost EMI across 3 to 12-month tenures",
      "20% increase in sales for partner agents",
      "40% higher booking conversion",
      "200% increase in customer queries",
    ],
    outcome: "Agents who offer No Cost EMI at checkout see 20% higher sales, 40% better conversion, and 200% more customer queries.",
    href: "/solutions/lending",
    accentBg: "bg-primary/5",
    accentBorder: "border-primary/10",
  },
  {
    icon: ShieldCheck,
    label: "Insurance",
    title: "Earn on every booking with embedded protection",
    desc: "Attach travel insurance directly inside your checkout. Trip cancellation, medical, baggage — issued instantly, with ancillary revenue on every policy sold.",
    points: [
      "Embedded at the point of booking",
      "Multiple underwriters and coverage plans",
      "Cancellation, medical, and baggage cover",
      "Ancillary revenue per transaction",
    ],
    outcome: "Protection products add a new revenue line without adding complexity to your sales process.",
    href: "/solutions/insurance",
    accentBg: "bg-brand-green/5",
    accentBorder: "border-brand-green/10",
  },
  {
    icon: CreditCard,
    label: "Payments",
    title: "Collect faster and settle in T+1",
    desc: "Accept every payment mode. Get settled the next business day. Automated reconciliation and GST-compliant invoicing — built for travel's unique settlement complexity.",
    points: [
      "T+1 settlement cycles",
      "All payment modes: UPI, cards, wallets, NEFT",
      "Automated reconciliation and tracking",
      "Reduced follow-up and collection friction",
    ],
    outcome: "Travel businesses using SanKash payments spend less time chasing collections and more time selling.",
    href: "/solutions/payments",
    accentBg: "bg-brand-coral/5",
    accentBorder: "border-brand-coral/10",
  },
];

const workflowSteps = [
  { num: "01", label: "Quote", desc: "Agent shares itinerary or package quote with the customer" },
  { num: "02", label: "Finance", desc: "Customer chooses No Cost EMI to book in monthly instalments at checkout" },
  { num: "03", label: "Protect", desc: "Travel insurance is attached directly to the booking" },
  { num: "04", label: "Collect", desc: "Payment is collected and settled to the agent in T+1" },
];

const audiences = [
  { icon: Users, label: "Travel agents & agencies", desc: "Sell smarter with financing, protection, and faster collections" },
  { icon: BarChart3, label: "OTAs & platforms", desc: "Embed lending, insurance, and payments via API" },
  { icon: Zap, label: "Distribution partners", desc: "Add SanKash products to your existing travel workflows" },
];

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.45 },
};

const Solutions = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="Travel Business Solutions — EMI, Insurance and Payments | SanKash"
        description="Explore SanKash solutions for travel businesses, including No Cost EMI at checkout, embedded insurance and faster payment collection."
      />
      {/* Hero */}
      <section className="bg-hero-gradient py-14 md:py-28">
        <div className="container max-w-3xl text-center space-y-5">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">Solutions</p>
          <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-primary-deep">
            Three growth engines for travel businesses
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Lending, Insurance, and Payments — each purpose-built for travel, integrated into one platform. Convert more bookings, earn more per transaction, and collect faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
            <Button size="lg" asChild>
              <Link to="/contact">Book a Demo</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/for-travel-agents">Explore For Travel Agents <ArrowRight size={14} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pillar deep-dives */}
      <section className="py-14 md:py-28">
        <div className="container space-y-10 md:space-y-16">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              {...fade}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <div className={`rounded-2xl border ${p.accentBorder} ${p.accentBg} p-5 sm:p-8 md:p-12`}>
                <div className="grid md:grid-cols-[1fr_340px] gap-10 items-start">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-card">
                        <p.icon size={20} className="text-primary" />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">{p.label}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-deep">{p.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
                    <ul className="space-y-2.5 pt-1">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2.5 text-sm text-foreground">
                          <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={p.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all pt-2"
                    >
                      Learn more <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="rounded-xl bg-card border p-6 shadow-card">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">Business outcome</p>
                    <p className="text-sm text-foreground leading-relaxed">{p.outcome}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How they work together */}
      <section className="py-12 md:py-28 bg-section-alt">
        <div className="container">
          <motion.div {...fade} className="max-w-2xl mb-14">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em] mb-3">Integrated workflow</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              More powerful together
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Each product works independently — but they're designed to run as one connected workflow. Quote, finance, protect, and collect in a single flow.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={step.num}
                {...fade}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative"
              >
                <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-card h-full">
                  <span className="text-3xl font-heading font-bold text-primary/15">{step.num}</span>
                  <h3 className="text-lg font-heading font-bold text-primary-deep mt-2">{step.label}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                    <ArrowRight size={14} className="text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-12 md:py-28">
        <div className="container">
          <motion.div {...fade} className="max-w-2xl mb-8 md:mb-12">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em] mb-3">Built for</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              Designed for travel businesses
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {audiences.map((a, i) => (
              <motion.div
                key={a.label}
                {...fade}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-card border rounded-xl p-6 shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <a.icon size={20} className="text-primary" />
                </div>
                <h3 className="text-base font-heading font-bold text-primary-deep">{a.label}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-brand-deep text-primary-foreground">
        <motion.div {...fade} className="container max-w-2xl text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Ready to grow your travel business?
          </h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            See how Lending, Insurance, and Payments work together to help you convert more bookings and earn more per transaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">Book a Demo</Link>
            </Button>
            <Button size="lg" variant="ghost-dark" asChild>
              <Link to="/for-travel-agents">Explore For Travel Agents <ArrowRight size={14} /></Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
};

export default Solutions;
