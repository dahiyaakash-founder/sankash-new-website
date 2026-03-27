import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote, ShieldCheck, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroInfra from "@/assets/hero-infrastructure.jpg";

const pillars = [
  { icon: Banknote, label: "Lending", desc: "Travel financing & EMI at point of sale", href: "/solutions/lending" },
  { icon: ShieldCheck, label: "Insurance", desc: "Embedded travel protection", href: "/solutions/insurance" },
  { icon: CreditCard, label: "Payments", desc: "T+1 settlement & collections", href: "/solutions/payments" },
];

const HomepageHero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Minimal teal top accent line */}
      <div className="h-0.5 bg-primary" />

      <div className="container py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left — Copy, 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Category tag */}
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
              SanKash gives travel businesses the tools to convert more bookings, 
              monetise every transaction, protect travelers, and collect payments faster — 
              all from one integrated platform.
            </p>

            {/* CTAs */}
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

            {/* Three pillars as compact cards */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  <Link
                    to={p.href}
                    className="group block p-4 rounded-xl border bg-card hover:shadow-card hover:border-primary/20 transition-all"
                  >
                    <p.icon size={18} className="text-primary mb-2.5" />
                    <p className="text-sm font-heading font-bold">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{p.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Product-led visual, 5 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-card-hover">
              <img
                src={heroInfra}
                alt="SanKash travel commerce infrastructure"
                className="w-full aspect-square object-cover"
                width={1400}
                height={900}
              />
              {/* Overlay stats */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/90 via-primary-deep/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { v: "8,000+", l: "Travel Partners" },
                    { v: "5L+", l: "Travelers Served" },
                    { v: "T+1", l: "Settlements" },
                  ].map((s) => (
                    <div key={s.l} className="text-center">
                      <div className="text-lg sm:text-xl font-heading font-bold text-primary-foreground">{s.v}</div>
                      <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
