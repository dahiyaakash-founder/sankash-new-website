import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Banknote, CheckCircle2, Users, Zap } from "lucide-react";

const features = [
  "No Cost EMI across leading banks",
  "Instant credit decisions in under 60 seconds",
  "Zero paperwork — fully digital flow",
  "Multiple lender partners for high approval rates",
  "Seamless checkout integration",
  "Dedicated lender relationship management",
];

const Lending = () => {
  return (
    <SiteLayout>
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Banknote size={28} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Lending</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              Travel Now, Pay Later
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Offer flexible EMI options at the point of sale. Increase ticket sizes, improve 
              conversion, and give customers the affordability they need.
            </p>
            <Link to="/contact">
              <Button size="xl" className="gap-2">Get Started <ArrowRight size={18} /></Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-bold">How lending works with SanKash</h2>
              <p className="text-muted-foreground leading-relaxed">
                SanKash connects travel agents with multiple lending partners to offer customers 
                instant financing at the point of booking. The entire flow is digital, from 
                application to disbursement.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Zap, v: "<60s", l: "Approval Time" },
                  { icon: Users, v: "15+", l: "Lender Partners" },
                  { icon: Banknote, v: "0%", l: "No Cost EMI" },
                ].map((s) => (
                  <div key={s.l} className="text-center p-4 rounded-xl bg-accent">
                    <s.icon size={20} className="text-primary mx-auto mb-2" />
                    <div className="text-2xl font-heading font-bold">{s.v}</div>
                    <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-heading font-bold mb-4">What you get</h3>
              {features.map((f) => (
                <div key={f} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                  <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Lending;
