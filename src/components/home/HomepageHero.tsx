import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AGENT_SIGNUP_URL } from "@/lib/constants";
import { trackAgentSignupClick } from "@/lib/analytics";

const agentActions = [
  {
    step: "01",
    label: "Offer No Cost EMI",
    title: "Let customers book holidays in monthly instalments at checkout",
    proof: "20% sales lift · 40% better conversion",
  },
  {
    step: "02",
    label: "Review customer quotes",
    title: "Upload an itinerary and spot pricing, value, and conversion gaps",
    proof: "AI-powered quote analysis for agents",
  },
  {
    step: "03",
    label: "Attach travel protection",
    title: "Embed insurance at checkout — earn ancillary revenue per booking",
    proof: "Cancellation, medical, and baggage cover",
  },
  {
    step: "04",
    label: "Collect payments",
    title: "Accept every payment mode. Get settled the next business day",
    proof: "T+1 settlement · ₹200Cr+ volume enabled",
  },
];

const HomepageHero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="h-0.5 bg-primary" />

      <div className="container py-8 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left — Agent-first copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 space-y-4 md:space-y-7"
          >
            <div className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-3.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                For Travel Agents & Businesses
              </span>
            </div>

            <h1 className="text-[1.75rem] sm:text-[2.5rem] md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-heading font-bold leading-[1.12] sm:leading-[1.08] tracking-[-0.02em] text-primary-deep">
              Close more bookings.
              <br />
              <span className="text-primary">Earn more per trip.</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Offer No Cost EMI to customers, review holiday quotes, attach travel protection, 
              and collect payments faster — everything a travel agent needs to convert better 
              and grow revenue.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={trackAgentSignupClick}>
                <Button size="lg" className="gap-2 text-sm font-semibold">
                  Get Started as an Agent <ArrowRight size={16} />
                </Button>
              </a>
              <Link to="/for-travel-agents">
                <Button variant="outline" size="lg" className="gap-2 text-sm font-semibold border-primary/25 text-primary hover:bg-accent">
                  <Upload size={15} /> Upload a Quote
                </Button>
              </Link>
            </div>

            {/* Quick-access tools */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/for-travel-agents">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-primary">
                  <Upload size={13} /> Upload a Quote
                </Button>
              </Link>
              <Link to="/emi-calculator">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-primary">
                  <Calculator size={13} /> EMI Calculator
                </Button>
              </Link>
            </div>

            {/* Trust stats inline */}
            <div className="grid grid-cols-3 gap-3 sm:gap-8 pt-4 border-t border-border/60">
              {[
                { v: "20%", l: "Sales Lift" },
                { v: "40%", l: "Better Conversion" },
                { v: "10,000+", l: "Travel Partners" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-base sm:text-xl font-heading font-bold text-primary-deep">{s.v}</div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Agent action cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-6 relative"
          >
            <div className="absolute left-7 top-6 bottom-6 w-px bg-border/60 hidden sm:block" />

            <div className="space-y-2.5 relative">
              {agentActions.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                  className="relative flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm"
                >
                  <div className="relative z-10 w-10 h-10 rounded-lg bg-accent/60 border border-border/40 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-heading font-bold text-primary">{card.step}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                    <p className="text-sm font-heading font-bold text-primary-deep mt-0.5">{card.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.proof}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
