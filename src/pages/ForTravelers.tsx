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
} from "lucide-react";
import TravelerQuoteUploader from "@/components/travelers/TravelerQuoteUploader";

const howItWorks = [
  { num: "01", icon: Upload, label: "Upload your holiday quote", desc: "Share a quote, itinerary, or screenshot from any travel agent." },
  { num: "02", icon: Search, label: "Review value and pricing", desc: "See if there's room for better structuring or savings on your trip." },
  { num: "03", icon: Calculator, label: "Check travel EMI options", desc: "Compare monthly payment plans across 3, 6, or 12-month tenures." },
  { num: "04", icon: BadgeCheck, label: "Get finance-ready to book", desc: "Pre-qualify for holiday financing so you're prepared when you decide." },
];

const emiExamples = [
  { tenure: "3 months", monthly: "₹28,333", total: "₹85,000", tag: "No Cost EMI" },
  { tenure: "6 months", monthly: "₹14,500", total: "₹87,000", tag: null },
  { tenure: "12 months", monthly: "₹7,600", total: "₹91,200", tag: "Most popular" },
];

const whyReasons = [
  {
    icon: Search,
    title: "Review your holiday quote for better value",
    desc: "Get a quick read on whether your travel quote could be structured differently — better pricing, better options, or both.",
  },
  {
    icon: Banknote,
    title: "See your travel EMI before you commit",
    desc: "Compare No Cost EMI and low-cost monthly payment plans so you know exactly what your holiday costs per month.",
  },
  {
    icon: Shield,
    title: "Match travel protection to your trip",
    desc: "Explore cancellation, medical, and baggage cover matched to your specific itinerary and destination.",
  },
  {
    icon: UserCheck,
    title: "Walk into your booking finance-ready",
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
    a: "SanKash works with any holiday that has a quoted cost — domestic family holidays, international packages, honeymoon trips, group tours, pilgrimage travel, and more. Whether your quote is ₹30,000 or ₹5,00,000, you can check EMI options and explore travel protection.",
  },
  {
    q: "How does holiday EMI work on SanKash?",
    a: "Once you upload your holiday quote, SanKash shows you indicative monthly payment options across 3, 6, and 12-month tenures from 15+ lending partners. No Cost EMI is available on select plans. You choose the tenure that works for you, and the lender disburses the full amount to your agent — so your booking is confirmed immediately.",
  },
];

const ForTravelers = () => {
  const uploaderRef = React.useRef<HTMLDivElement>(null);

  const scrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <SiteLayout>
      <SEOHead
        title="Holiday EMI and Travel Payment Options | SanKash"
        description="Upload your holiday quote to check EMI options, explore travel insurance, and get finance-ready before you book. No obligation, no credit score impact."
        jsonLd={createFAQSchema(faqs)}
      />
      {/* Hero */}
      <section className="bg-hero-gradient py-14 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 lg:pt-4"
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
                Upload your holiday quote to explore better-value options and check travel EMI plans — before you commit to booking.
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
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              How holiday quote review works
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
                className="text-center p-4 rounded-xl"
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

      {/* EMI & Affordability */}
      <section id="emi-section" className="py-16 md:py-22 bg-section-alt">
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
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Travel EMI — pay monthly, book now
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Split your holiday cost into comfortable monthly payments with No Cost EMI or low-cost travel EMI options across 15+ lending partners. Checking eligibility doesn't affect your credit score.
              </p>
              <div className="flex flex-wrap gap-3">
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
              <div className="bg-card rounded-2xl border shadow-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <CreditCard size={14} className="text-primary" />
                  Indicative EMI for a ₹85,000 trip
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
                  * Indicative amounts. Final options depend on lender approval and trip details.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Use SanKash */}
      <section className="py-16 md:py-22">
        <div className="container">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              Why Use SanKash
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
              Four reasons to check first
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
                className="p-5 rounded-2xl border bg-card hover:shadow-card transition-shadow"
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

      {/* Trust & FAQ */}
      <section className="py-16 md:py-22 bg-section-alt">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
                Built for real travel bookings
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                8,000+ travel partners. 15+ lending institutions. 5L+ travelers served.
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
                Common questions
              </h3>
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-card rounded-xl border p-3.5 cursor-pointer"
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
        { label: "Ask about my quote", link: "/for-travelers" },
        { label: "Check EMI options", href: "#emi-section" },
      ]} />

      {/* Final CTA */}
      <section className="py-14 md:py-20 bg-brand-deep relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container relative max-w-3xl text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground tracking-tight">
            Don't just book. Book smarter.
          </h2>
          <p className="text-primary-foreground/50 text-lg leading-relaxed max-w-lg mx-auto">
            Upload your holiday quote and see if there's a better way to structure, finance, or protect your trip.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
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
      <section className="py-6 bg-background">
        <div className="container max-w-2xl text-center">
          <p className="text-[11px] text-muted-foreground">
            * EMI options and savings are indicative. Final offers depend on lender approval, trip details, and agent terms. SanKash facilitates — your travel agent finalizes.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForTravelers;
