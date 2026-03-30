import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CheckCircle2, Heart, Plane, Briefcase } from "lucide-react";

const coverageTypes = [
  { icon: Plane, title: "Trip Cancellation", desc: "Coverage for unexpected cancellations and trip interruptions." },
  { icon: Heart, title: "Medical Emergencies", desc: "Comprehensive medical coverage including evacuation." },
  { icon: Briefcase, title: "Baggage Protection", desc: "Coverage for lost, damaged, or delayed baggage." },
];

const Insurance = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="Embedded Travel Insurance for Travel Businesses | SanKash Insurance"
        description="Add travel protection at checkout with embedded insurance for trip cancellation, medical and baggage coverage."
      />
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center">
              <ShieldCheck size={28} className="text-secondary-foreground" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Insurance</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              Travel Protection, Built In
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Embed comprehensive travel insurance into your booking flow. Protect travelers 
              and earn ancillary revenue on every transaction.
            </p>
            <Link to="/contact">
              <Button size="xl" className="gap-2">Get Started <ArrowRight size={18} /></Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-14">Coverage Types</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {coverageTypes.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-8 rounded-2xl border bg-card text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
                  <c.icon size={24} className="text-secondary-foreground" />
                </div>
                <h3 className="text-lg font-heading font-bold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Why embed insurance?</h2>
          <div className="space-y-3">
            {[
              "Increase ancillary revenue per booking",
              "Seamless embedded checkout — no redirects",
              "Multiple coverage tiers for different trip types",
              "Automated claims support for your customers",
              "Fully digital policy issuance",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Insurance;
