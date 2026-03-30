import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard, CheckCircle2, Clock, BarChart3, Wallet } from "lucide-react";

const Payments = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="Travel Payment Collection and T+1 Settlement | SanKash Payments"
        description="Collect payments faster, reconcile better and manage travel settlement complexity with SanKash Payments."
      />
      <section className="bg-hero-gradient py-14 md:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
              <CreditCard size={28} className="text-accent-foreground" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Payments</p>
            <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              Seamless Settlement Infrastructure
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Get paid faster with T+1 settlements. Accept all payment modes. 
              Transparent reconciliation built for travel's unique needs.
            </p>
            <Link to="/contact">
              <Button size="xl" className="gap-2">Get Started <ArrowRight size={18} /></Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold mb-14">Key capabilities</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Clock, title: "T+1 Settlement", desc: "Get paid the next business day. No more waiting for weeks." },
              { icon: Wallet, title: "All Payment Modes", desc: "UPI, cards, net banking, wallets — accept everything." },
              { icon: BarChart3, title: "Auto Reconciliation", desc: "Real-time tracking and automated reconciliation reports." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-8 rounded-2xl border bg-card text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <f.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-heading font-bold text-center mb-8">Built for travel</h3>
            <div className="space-y-3">
              {[
                "Payment splitting for multi-supplier bookings",
                "Automated GST-compliant invoicing",
                "Real-time settlement tracking dashboard",
                "Secure PCI-DSS compliant infrastructure",
                "Dedicated payment operations support",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3 p-4 rounded-xl bg-accent/50">
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

export default Payments;
