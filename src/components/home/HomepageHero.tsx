import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, ShieldCheck, CreditCard, FileText, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const proofCards = [
  {
    icon: FileText,
    step: "01",
    label: "Review quotes",
    title: "Review holiday quotes",
    proof: "Spot pricing, value, and conversion gaps",
  },
  {
    icon: Banknote,
    step: "02",
    label: "Offer No Cost EMI",
    title: "Let customers book holidays in monthly instalments at checkout",
    proof: "20% sales lift · 40% better conversion",
  },
  {
    icon: ShieldCheck,
    step: "03",
    label: "Add protection",
    title: "Embed travel protection",
    proof: "Cancellation, medical, and baggage cover",
  },
  {
    icon: CreditCard,
    step: "04",
    label: "Collect payments",
    title: "Collect customer payments",
    proof: "₹200Cr+ payment volume enabled",
  },
];

const HomepageHero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="h-0.5 bg-primary" />

      <div className="container py-10 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 space-y-5 md:space-y-7"
          >
            <div className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-3.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                Travel Commerce Infrastructure
              </span>
            </div>

            <h1 className="text-[1.75rem] sm:text-[2.5rem] md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-heading font-bold leading-[1.12] sm:leading-[1.08] tracking-[-0.02em] text-primary-deep">
              Lending. Insurance. Payments.
              <br />
              <span className="text-primary">Built for travel growth.</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed">
              The integrated platform that helps travel businesses convert more bookings, 
              monetise every transaction, embed traveler protection, and accelerate 
              collections — purpose-built for how travel actually works.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/solutions">
                <Button size="lg" className="gap-2 text-sm font-semibold">
                  Explore Solutions <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="text-sm font-semibold border-primary/25 text-primary hover:bg-accent">
                  Book a Demo
                </Button>
              </Link>
            </div>

            {/* Trust stats inline */}
            <div className="grid grid-cols-3 gap-4 sm:flex sm:gap-8 pt-4 border-t border-border/60">
              {[
                { v: "8,000+", l: "Travel Partners" },
                { v: "5 Million+", l: "Travelers Served" },
                { v: "T+1", l: "Agent Settlements" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-base sm:text-xl font-heading font-bold text-primary-deep">{s.v}</div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Product proof cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-6 relative"
          >
            {/* Workflow connector line */}
            <div className="absolute left-7 top-6 bottom-6 w-px bg-border/60 hidden sm:block" />

            <div className="space-y-2.5 relative">
              {proofCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                  className="relative flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm"
                >
                  {/* Step number */}
                  <div className="relative z-10 w-10 h-10 rounded-lg bg-accent/60 border border-border/40 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-heading font-bold text-primary">{card.step}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                      <CheckCircle2 size={14} className="text-brand-green shrink-0" />
                    </div>
                    <p className="text-sm font-heading font-bold text-primary-deep mt-0.5">{card.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.proof}</p>
                  </div>
                </motion.div>
              ))}

              {/* Summary footer */}
              <div className="flex items-center gap-2 pl-14 pt-1">
                <Clock size={12} className="text-brand-green" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Review → Finance → Protect → Collect
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
