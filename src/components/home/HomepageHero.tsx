import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Calculator, Briefcase } from "lucide-react";
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
              Know what your holiday really costs
              <br />
              <span className="text-primary">before you pay.</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Upload your travel quote for a free breakdown, or check what your trip costs per month — <span className="text-foreground font-medium">no credit impact</span>.
            </p>

            {/* Two clear traveler actions */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2">
              <Link to="/for-travelers#quote-upload-section" className="group">
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary/20 bg-card/80 hover:shadow-card-hover hover:border-primary/40 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Upload size={18} className="text-primary" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-heading font-bold text-primary-deep">Upload a Quote</p>
                    <p className="text-xs text-muted-foreground">Get a free review in 2 mins</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
              <Link to="/for-travelers#emi-section" className="group">
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand-coral/20 bg-card/80 hover:shadow-card-hover hover:border-brand-coral/40 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-brand-coral/10 flex items-center justify-center shrink-0">
                    <Calculator size={18} className="text-brand-coral" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-heading font-bold text-primary-deep">Check Holiday EMI</p>
                    <p className="text-xs text-muted-foreground">See monthly cost, no impact on credit</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-brand-coral transition-colors shrink-0" />
                </div>
              </Link>
            </div>

            {/* Travel business + agent login — clearly secondary */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link to="/for-travel-agents">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30">
                  <Briefcase size={13} /> Travel business? Explore tools →
                </Button>
              </Link>
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
