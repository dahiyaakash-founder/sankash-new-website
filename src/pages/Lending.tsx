import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Banknote, CheckCircle2, Users, Zap } from "lucide-react";

const features = [
  "No Cost EMI at checkout across leading banks",
  "20% increase in agent sales",
  "40% higher booking conversion",
  "200% increase in customer queries",
  "Seamless checkout integration — no workflow changes",
  "Fully digital, zero-paperwork approval flow",
];

const Lending = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="Travel Lending and No Cost EMI for Agents | SanKash"
        description="Offer No Cost EMI and instant travel financing at point of sale. 15+ lender partners, under 60-second approvals, and zero paperwork for travel agents."
      />
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Banknote size={28} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Lending</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              No Cost EMI for travel bookings
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Offer No Cost EMI at checkout. Help customers book holidays in monthly instalments 
              and unlock 20% higher sales, 40% better conversion, and 200% more customer queries.
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
              <h2 className="text-3xl font-heading font-bold">How No Cost EMI works with SanKash</h2>
              <p className="text-muted-foreground leading-relaxed">
                SanKash enables travel agents to offer No Cost EMI at checkout, letting customers 
                book holidays in monthly instalments. The entire flow is digital and embedded 
                into the booking workflow — no paperwork, no redirects.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Zap, v: "20%", l: "Sales Increase" },
                  { icon: Users, v: "40%", l: "Better Conversion" },
                  { icon: Banknote, v: "200%", l: "More Queries" },
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
