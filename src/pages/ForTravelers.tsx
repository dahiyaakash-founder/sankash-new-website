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
  Calculator,
  CheckCircle2,
  Shield,
  CreditCard,
  Banknote,
  HelpCircle,
  Phone,
  Clock,
  BadgeCheck,
  UserCheck,
} from "lucide-react";
import TravelerQuoteUploader from "@/components/travelers/TravelerQuoteUploader";

const howItWorks = [
  { num: "01", icon: Upload, label: "Upload your quote", desc: "Share an itinerary, quote, screenshot, or PDF from any travel agent." },
  { num: "02", icon: Search, label: "Explore value", desc: "See if there's room for optimisation, better structuring, or savings." },
  { num: "03", icon: Calculator, label: "Check EMI options", desc: "Understand monthly outflow across 3, 6, 9, or 12-month tenures." },
  { num: "04", icon: BadgeCheck, label: "Get finance-ready", desc: "Pre-qualify for trip financing so you're ready when you decide to book." },
];

const emiExamples = [
  { tenure: "3 months", monthly: "₹28,333", total: "₹85,000", tag: "No Cost EMI" },
  { tenure: "6 months", monthly: "₹14,500", total: "₹87,000", tag: null },
  { tenure: "12 months", monthly: "₹7,600", total: "₹91,200", tag: "Most popular" },
];

const whyReasons = [
  {
    icon: Search,
    title: "Know if your quote has room for improvement",
    desc: "Get a first read on whether there's scope for better structuring, pricing, or value — before you commit.",
  },
  {
    icon: Banknote,
    title: "See monthly payment options before you commit",
    desc: "Understand your EMI choices across 3, 6, or 12-month tenures so your trip fits your monthly budget.",
  },
  {
    icon: Shield,
    title: "Match protection to your trip",
    desc: "Explore cancellation cover, medical, and baggage protection options relevant to your specific itinerary.",
  },
  {
    icon: UserCheck,
    title: "Get finance-ready before you decide",
    desc: "Pre-qualify for trip financing so you're ready to book with confidence when the time is right.",
  },
];

const faqs = [
  {
    q: "Do I need to book through SanKash?",
    a: "No. You continue booking through your travel agent as usual. SanKash only reviews your quote and helps you explore financing and protection options — we don't replace your agent or change your booking.",
  },
  {
    q: "Is the quote review free?",
    a: "Yes. The initial review is completely free. Detailed recommendations may require sharing your contact details so our team can assist you.",
  },
  {
    q: "Will checking EMI affect my credit score?",
    a: "No. Checking eligibility is a soft enquiry and does not impact your credit score.",
  },
  {
    q: "What types of trips does this work for?",
    a: "Domestic holidays, international packages, honeymoon trips, group travel, and pilgrimage tours — any trip with a quoted cost.",
  },
  {
    q: "How accurate are the initial observations?",
    a: "The initial review is indicative and based on trip signals. A detailed review by our team provides specific, actionable recommendations.",
  },
];

const ForTravelers = () => {
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
                For Travelers
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight text-foreground">
                Already got a holiday quote?
                <br />
                <span className="text-gradient-brand">Check it before you book.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Upload a quote, itinerary, or screenshot to explore better-value possibilities
                and understand your monthly payment options — before you commit.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button size="xl" className="gap-2" onClick={scrollToUploader}>
                  Upload My Quote <ArrowRight size={18} />
                </Button>
                <a href="#emi-section">
                  <Button variant="outline" size="xl" className="gap-2">
                    <Calculator size={16} /> Check EMI Options
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
              <TravelerQuoteUploader />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How Quote Review Works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              From quote to confidence in 4 steps
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
              Upload what you have. We'll help you understand what's possible.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center p-5 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-heading font-bold text-sm">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                  <step.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1 text-sm">{step.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EMI & Affordability */}
      <section id="emi-section" className="py-20 md:py-28 bg-section-alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                EMI & Affordability
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Your trip doesn't have to wait
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Break your holiday cost into comfortable monthly payments.
                No Cost EMI and low-cost EMI options available across 15+ lending partners.
                Check your eligibility without affecting your credit score.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button size="lg" className="gap-2" onClick={scrollToUploader}>
                  Upload a Quote <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-card rounded-2xl border shadow-card p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <CreditCard size={14} className="text-primary" />
                  Indicative EMI for a ₹85,000 trip
                </div>
                <div className="space-y-3">
                  {emiExamples.map((emi) => (
                    <div
                      key={emi.tenure}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-accent/40 border border-border/50"
                    >
                      <div>
                        <p className="font-heading font-bold text-foreground text-sm">
                          {emi.monthly}
                          <span className="text-muted-foreground font-normal text-xs"> /month</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">{emi.tenure}</p>
                      </div>
                      {emi.tag && (
                        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                          {emi.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  * EMI amounts are indicative. Final options depend on lender approval and trip details.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Use SanKash Before Booking */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Why Use SanKash
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              Be informed before you book
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
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

      {/* Trust & FAQ */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Built for real travel bookings
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                SanKash works with 8,000+ travel partners and 15+ lending institutions
                to help travelers make informed, confident booking decisions.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  "Built for real holiday quotes — not hypothetical scenarios",
                  "The review helps you before you commit — no obligation to proceed",
                  "Checking EMI eligibility does not affect your credit score",
                  "Your travel agent finalises the booking — SanKash only facilitates",
                  "5L+ travelers have explored trip financing through SanKash",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-brand-green shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                Common questions
              </h3>
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-card rounded-xl border p-4 cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-heading font-bold text-sm text-foreground list-none">
                    {faq.q}
                    <HelpCircle size={16} className="text-muted-foreground shrink-0 ml-2 group-open:text-primary transition-colors" />
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3 pr-6">
                    {faq.a}
                  </p>
                </details>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <AssistantEntryPoint prompts={[
        { label: "Ask about my quote", link: "/for-travelers" },
        { label: "Check EMI options", href: "#emi" },
        { label: "Understand next steps", link: "/contact" },
      ]} />

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-brand-deep relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container relative max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground tracking-tight">
            Don't just book. Book smarter.
          </h2>
          <p className="text-primary-foreground/50 text-lg leading-relaxed max-w-lg mx-auto">
            Upload your holiday quote and find out if there's a better way
            to structure, finance, or protect your trip.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              size="xl"
              className="gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
              onClick={scrollToUploader}
            >
              Upload My Quote <ArrowRight size={18} />
            </Button>
            <a href="#emi-section">
              <Button variant="ghost-dark" size="xl" className="gap-2">
                <Calculator size={16} /> Check EMI Options
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-background">
        <div className="container max-w-2xl text-center">
          <p className="text-[11px] text-muted-foreground">
            * EMI options and savings shown are indicative and subject to review. Final offers depend on
            lender approval, trip details, and agent terms. SanKash facilitates — your travel agent finalizes.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForTravelers;
