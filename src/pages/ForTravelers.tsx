import React from "react";
import SiteLayout from "@/components/SiteLayout";
import SEOHead, { createFAQSchema } from "@/components/SEOHead";
import AssistantEntryPoint from "@/components/AssistantEntryPoint";
import { Button } from "@/components/ui/button";

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
  BadgeCheck,
  UserCheck,
  Star,
} from "lucide-react";
import TravelerQuoteUploader from "@/components/travelers/TravelerQuoteUploader";
import TravelerEmiEnquiry from "@/components/travelers/TravelerEmiEnquiry";
import { markTravelerIntentSignal } from "@/lib/traveler-intent-session";

const howItWorks = [
  { num: "01", icon: Upload, label: "Upload your holiday quote", desc: "Share a quote, itinerary, or screenshot from any travel agent." },
  { num: "02", icon: Search, label: "Review value and pricing", desc: "See if there's room for better structuring or savings on your trip." },
  { num: "03", icon: Calculator, label: "Check travel EMI options", desc: "Compare monthly payment plans across 3, 6, 9, 12, 18, and 24-month tenures." },
  { num: "04", icon: BadgeCheck, label: "Get finance-ready to book", desc: "Pre-qualify for holiday financing so you're prepared when you decide." },
];

import { calculateEmi, formatINR as fmtINR } from "@/lib/emi-calculator";

function computeEmiExamples(amount: number) {
  const e3 = calculateEmi(amount, 3, "no_cost");
  const e6 = calculateEmi(amount, 6, "no_cost");
  const e12 = calculateEmi(amount, 12, "standard");
  return [
    { tenure: "3 months", monthly: fmtINR(e3.monthlyEmi), total: fmtINR(e3.totalPayable), tag: "No Cost EMI" },
    { tenure: "6 months", monthly: fmtINR(e6.monthlyEmi), total: fmtINR(e6.totalPayable), tag: "No Cost EMI" },
    { tenure: "12 months", monthly: fmtINR(e12.monthlyEmi), total: fmtINR(e12.totalPayable), tag: "Most popular" },
  ];
}

const whyReasons = [
  {
    icon: Search,
    title: "Spot gaps in your quote before paying",
    desc: "Get a quick read on whether your travel quote could be structured differently — better pricing, better options, or both.",
  },
  {
    icon: Banknote,
    title: "Understand affordability upfront",
    desc: "Compare No Cost EMI and low-cost monthly payment plans so you know exactly what your holiday costs per month.",
  },
  {
    icon: Shield,
    title: "Match travel protection to your trip",
    desc: "Explore cancellation, medical, and baggage cover matched to your specific itinerary and destination.",
  },
  {
    icon: UserCheck,
    title: "Walk in finance-ready, not finance-surprised",
    desc: "Pre-qualify for trip financing before you sit down with your agent — no credit score impact, no obligation.",
  },
];

const faqs = [
  {
    q: "Do I need to book through SanKash?",
    a: "No. SanKash does not replace your travel agent. You continue booking through your agent as usual. SanKash reviews your holiday quote and helps you explore EMI options, travel insurance, and better structuring — so you're more informed before you commit.",
  },
  {
    q: "Is the holiday quote review free?",
    a: "Yes. Uploading your travel quote and getting an initial review is completely free. There's no obligation to proceed. If you want a detailed review with specific EMI options and insurance recommendations, you may need to share your contact details so our team can follow up.",
  },
  {
    q: "Will checking travel EMI affect my credit score?",
    a: "No. When you check EMI eligibility on SanKash, it's a soft enquiry — it does not appear on your credit report and has no impact on your credit score. A hard credit check only happens if you formally apply for financing with a lender.",
  },
  {
    q: "What types of trips and holidays does this work for?",
    a: "SanKash works with any holiday that has a quoted cost — domestic family holidays, international packages, honeymoon trips, group tours, pilgrimage travel, and more. Travel EMI can be available for full holiday packages as well as eligible partial bookings such as flights, hotels, or land packages. Final availability depends on booking type, customer profile, merchant setup, and lender approval.",
  },
  {
    q: "How does holiday EMI work on SanKash?",
    a: "Once you upload your holiday quote, SanKash shows you indicative monthly payment options across 3, 6, 9, 12, 18, and 24-month tenures from 15+ lending partners. No Cost EMI (zero interest, 2.5% processing fee) is available on 3 and 6-month plans. Standard EMI (1.25% flat per month, 2.5% processing fee) applies on 9–24 month tenures. Subject to customer eligibility and lender approval. You choose the tenure that works for you, and the lender disburses the full amount to your agent — so your booking is confirmed immediately. T&C apply.",
  },
  {
    q: "Can I use SanKash if I am not booking through a registered SanKash travel agent?",
    a: "Yes, in many cases you can. You may book through your own travel agent, make eligible direct travel bookings, or share the details of a non-registered agent with us. Where feasible, our team can evaluate and onboard the agent so your booking can be supported through SanKash.",
  },
];

const ForTravelers = () => {
  const uploaderRef = React.useRef<HTMLDivElement>(null);
  const emiSectionRef = React.useRef<HTMLDivElement>(null);
  const [emiAmount, setEmiAmount] = React.useState(85000);
  const emiExamples = React.useMemo(() => computeEmiExamples(emiAmount), [emiAmount]);

  const handleEmiAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw || "0", 10);
    if (num <= 500000) setEmiAmount(num);
  };

  const scrollToUploader = () => {
    markTravelerIntentSignal("opened_upload_section");
    uploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToEmi = () => {
    emiSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  React.useEffect(() => {
    const target = emiSectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    let hasMarked = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasMarked) {
            hasMarked = true;
            markTravelerIntentSignal("viewed_emi_section");
          }
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <SiteLayout>
      <SEOHead
        title="Travel EMI — Pay for Your Holiday in Easy Monthly Instalments | SanKash"
        description="Check what your holiday costs per month. Upload a quote or enter an amount to see No Cost EMI options from 15+ lenders. No credit score impact."
        jsonLd={createFAQSchema(faqs)}
      />

      {/* ── Hero ── */}
      <section className="bg-hero-gradient py-10 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-3.5 py-1">
              <Star size={12} className="text-brand-coral" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                Used by 5 Million+ travelers
              </span>
            </div>

            <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight text-foreground">
              Make a smarter holiday decision
              <br />
              <span className="text-gradient-brand">before you pay.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Compare your quote. Understand what it costs per month. Spot gaps before you commit.
              SanKash helps you get clarity — not just a loan.
            </p>

            {/* Trust bar */}
            <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-brand-green" /> Free quote review
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-brand-green" /> No credit score impact
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-brand-green" /> 15+ lending partners
              </span>
            </div>
          </motion.div>

          {/* ── Dual-path journey cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8"
          >
            {/* Path 1: Have a quote */}
            <button
              onClick={scrollToUploader}
              className="group text-left p-5 rounded-2xl border-2 border-primary/20 bg-card hover:border-primary/40 hover:shadow-card-hover transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Upload size={20} className="text-primary" />
              </div>
              <h3 className="text-base font-heading font-bold text-foreground mb-1">
                I have a travel quote
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Upload your itinerary or quote for a free review with EMI options.
              </p>
              <p className="text-[11px] text-muted-foreground/70 italic">
                → We'll review your quote and show where you can save or pay monthly.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-3 group-hover:gap-2.5 transition-all">
                Upload & Review <ArrowRight size={14} />
              </span>
            </button>

            {/* Path 2: No quote yet */}
            <button
              onClick={scrollToEmi}
              className="group text-left p-5 rounded-2xl border-2 border-brand-coral/20 bg-card hover:border-brand-coral/40 hover:shadow-card-hover transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-coral/10 flex items-center justify-center mb-3">
                <Calculator size={20} className="text-brand-coral" />
              </div>
              <h3 className="text-base font-heading font-bold text-foreground mb-1">
                I'm still exploring
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Tell us where you want to go — we'll show what it costs per month.
              </p>
              <p className="text-[11px] text-muted-foreground/70 italic">
                → Share destination & budget. Get indicative EMI options, no commitment.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-coral mt-3 group-hover:gap-2.5 transition-all">
                Check Holiday EMI <ArrowRight size={14} />
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Quote Upload Section ── */}
      <section className="py-10 md:py-20" ref={uploaderRef} id="quote-upload-section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4 lg:pt-4"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                Have a quote?
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Upload it. We'll tell you if it's a good deal.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Share your itinerary, quote PDF, or even a screenshot. Our team reviews it for pricing, 
                inclusions, and protection gaps — and shows you what it could cost per month with EMI.
              </p>
              <div className="space-y-2.5 pt-1">
                {[
                  "Free review — no obligation to proceed",
                  "Works with any travel agent's quote",
                  "Get EMI options and insurance suggestions",
                  "Your agent still finalises the booking",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-brand-green shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TravelerQuoteUploader />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EMI & Affordability ── */}
      <section id="emi-section" ref={emiSectionRef} className="py-10 md:py-22 bg-section-alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                EMI & Affordability
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                What does your holiday actually cost per month?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Enter any trip amount and instantly see monthly payment options. No Cost EMI on 3 and 6-month plans. 
                Standard EMI for longer tenures. Checking doesn't affect your credit score.
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                No Cost EMI is subject to customer eligibility and lender approval. T&C apply.
              </p>
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
                  <span>Indicative EMI for a ₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={emiAmount > 0 ? emiAmount.toLocaleString("en-IN") : ""}
                    onChange={handleEmiAmountChange}
                    className="w-[80px] bg-accent/60 border border-border rounded px-1.5 py-0.5 text-xs font-bold text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span>trip</span>
                </div>
                <div className="space-y-2.5">
                  {emiExamples.map((emi) => (
                    <div
                      key={emi.tenure}
                      className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/50"
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
                <p className="text-[10px] text-muted-foreground text-center">
                  * Indicative amounts. Final options depend on lender approval, trip details, and agent terms.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EMI Enquiry — no quote path ── */}
      <section className="py-10 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4 lg:pt-4"
            >
              <p className="text-xs font-semibold text-brand-coral uppercase tracking-widest">
                Don't have a quote yet?
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Just tell us where you want to go
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Share your destination and budget. We'll send you indicative monthly payment options 
                so you can plan your holiday with confidence — before speaking to any agent.
              </p>
              <div className="space-y-2.5 pt-1">
                {[
                  "No quote needed — just destination and budget",
                  "Get indicative EMI options in minutes",
                  "No credit score impact, no obligation",
                  "Our team follows up with personalised options",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-brand-green shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TravelerEmiEnquiry />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why SanKash ── */}
      <section className="py-10 md:py-22">
        <div className="container">
          <div className="max-w-2xl mb-6 md:mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              Why Use SanKash
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              Make smarter holiday decisions
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {whyReasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-4 sm:p-5 rounded-2xl border bg-card hover:shadow-card transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
                  <r.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1.5 text-sm">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-10 md:py-20 bg-section-alt">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-7 md:mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              Four steps to a better holiday deal
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center p-3 sm:p-4 rounded-xl"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-heading font-bold text-xs">
                  {step.num}
                </div>
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mx-auto mb-2.5">
                  <step.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1 text-sm">{step.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & FAQ ── */}
      <section className="py-10 md:py-22">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Trusted by real travelers and travel partners
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                10,000+ travel agent partners. 15+ lending institutions. Over 5 Million+ travelers have used SanKash for holiday financing and quote reviews.
              </p>
              <div className="space-y-3 pt-1">
                {[
                  "Works with real holiday quotes, not hypothetical scenarios",
                  "No obligation — the review helps you before you commit",
                  "EMI eligibility checks don't affect your credit score",
                  "Your agent finalises the booking — SanKash only facilitates",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-brand-green shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-xl font-heading font-bold text-foreground mb-1">
                Holiday EMI and quote review FAQs
              </h3>
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-card rounded-xl border p-3 sm:p-3.5 cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-heading font-bold text-sm text-foreground list-none">
                    {faq.q}
                    <HelpCircle size={15} className="text-muted-foreground shrink-0 ml-2 group-open:text-primary transition-colors" />
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2.5 pr-6">
                    {faq.a}
                  </p>
                </details>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <AssistantEntryPoint prompts={[
        { label: "Ask about my quote", onClick: () => document.getElementById("quote-upload-section")?.scrollIntoView({ behavior: "smooth", block: "center" }) },
        { label: "Check EMI options", href: "#emi-section" },
      ]} />

      {/* ── Final CTA ── */}
      <section className="py-10 md:py-20 bg-brand-deep relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container relative max-w-3xl text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary-foreground tracking-tight">
            Don't just book. Book smarter.
          </h2>
          <p className="text-primary-foreground/50 text-lg leading-relaxed max-w-lg mx-auto">
            Upload your holiday quote or check EMI — know exactly what you're paying before you commit.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
            <Button
              size="xl"
              className="gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90 w-full sm:w-auto"
              onClick={scrollToUploader}
            >
              Upload My Quote <ArrowRight size={18} />
            </Button>
            <Button variant="ghost-dark" size="xl" className="gap-2 w-full sm:w-auto" onClick={scrollToEmi}>
              <Calculator size={16} /> Check EMI Options
            </Button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 bg-background">
        <div className="container max-w-2xl text-center">
          <p className="text-[11px] text-muted-foreground">
            * EMI options and savings are indicative. Final offers depend on lender approval, trip details, and agent terms. No Cost EMI is subject to customer eligibility and lender approval. T&C apply. SanKash facilitates — your travel agent finalizes.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForTravelers;
