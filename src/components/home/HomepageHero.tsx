import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroUI from "@/assets/hero-platform-ui.jpg";

const HomepageHero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="h-0.5 bg-primary" />

      <div className="container py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 space-y-7"
          >
            <div className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-3.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                Travel Commerce Infrastructure
              </span>
            </div>

            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-heading font-bold leading-[1.08] tracking-[-0.02em] text-primary-deep">
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
            <div className="flex gap-8 pt-4 border-t border-border/60">
              {[
                { v: "8,000+", l: "Travel Partners" },
                { v: "5L+", l: "Travelers Served" },
                { v: "T+1", l: "Settlements" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-xl font-heading font-bold text-primary-deep">{s.v}</div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Product visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-card-hover border border-border/40">
              <img
                src={heroUI}
                alt="SanKash travel commerce platform dashboard"
                className="w-full aspect-[4/3] object-cover"
                width={1280}
                height={960}
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-3 left-6 bg-card border rounded-xl px-4 py-2.5 shadow-card flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-primary font-heading font-bold text-xs">3</span>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-primary-deep">Growth Engines</p>
                <p className="text-[10px] text-muted-foreground">Lending · Insurance · Payments</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
