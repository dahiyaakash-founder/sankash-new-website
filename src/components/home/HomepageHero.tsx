import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AGENT_LOGIN_URL } from "@/lib/constants";
import { trackAgentLoginClick } from "@/lib/analytics";

const HomepageHero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="h-0.5 bg-primary" />

      <div className="container py-10 md:py-24 lg:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-5 md:space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-5 md:space-y-7"
          >
            <div className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-3.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                Travel Fintech Platform
              </span>
            </div>

            <h1 className="text-[1.75rem] sm:text-[2.5rem] md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-heading font-bold leading-[1.12] sm:leading-[1.08] tracking-[-0.02em] text-primary-deep">
              Travel payments, financing,
              <br />
              <span className="text-primary">and protection — simplified.</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              SanKash helps travelers pay for holidays in EMIs, and helps travel businesses 
              grow revenue with lending, insurance, and faster payments — all from one platform.
            </p>

            {/* Dual audience paths */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2">
              <Link to="/for-travelers" className="group">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card/80 hover:shadow-card-hover hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-brand-coral/10 flex items-center justify-center shrink-0">
                    <Plane size={18} className="text-brand-coral" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-heading font-bold text-primary-deep">I'm a traveler</p>
                    <p className="text-xs text-muted-foreground">Check EMI · Review my quote</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
              <Link to="/for-travel-agents" className="group">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card/80 hover:shadow-card-hover hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase size={18} className="text-primary" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-heading font-bold text-primary-deep">I'm a travel agent</p>
                    <p className="text-xs text-muted-foreground">EMI · Insurance · Payments</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
            </div>

            {/* Existing agent quick-access */}
            <div className="flex justify-center pt-1">
              <a
                href={AGENT_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAgentLoginClick({ cta_location: "hero" })}
              >
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-primary">
                  Existing agent? Log in →
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-6 border-t border-border/60 max-w-2xl mx-auto"
          >
            {[
              { v: "5M+", l: "Travelers Served" },
              { v: "10,000+", l: "Travel Partners" },
              { v: "15+", l: "Lending Partners" },
              { v: "₹200Cr+", l: "Volume Enabled" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-base sm:text-xl font-heading font-bold text-primary-deep">{s.v}</div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
