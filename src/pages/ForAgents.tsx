import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Upload, TrendingUp, Zap, Users, BarChart3, Shield, CreditCard } from "lucide-react";

const features = [
  { icon: CreditCard, title: "Offer EMI at Point of Sale", desc: "Let customers pay in installments — instant approval, zero paperwork." },
  { icon: Shield, title: "Embed Travel Insurance", desc: "Add insurance to every booking. Earn ancillary revenue effortlessly." },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Track bookings, conversion rates, and revenue from a single dashboard." },
  { icon: Upload, title: "Itinerary Optimizer", desc: "Upload an itinerary and get AI-powered suggestions to make it more competitive." },
  { icon: Zap, title: "T+1 Settlements", desc: "Get paid the next business day after booking confirmation. No delays." },
  { icon: Users, title: "Dedicated Partner Support", desc: "Every partner gets a dedicated relationship manager for hands-on help." },
];

const ForAgents = () => {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-6"
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">For Travel Agents & Businesses</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              Everything you need to <span className="text-gradient-primary">sell more travel</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              SanKash equips travel agents and OTAs with lending, insurance, and payment products 
              that drive higher conversion and customer satisfaction.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button size="xl" className="gap-2">Get Started <ArrowRight size={18} /></Button>
              </Link>
              <Button variant="outline" size="xl">Agent Login</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "8K+", l: "Travel Partners" },
            { v: "40%", l: "Higher Conversion" },
            { v: "T+1", l: "Settlement" },
            { v: "20%", l: "More Inquiries" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">{s.v}</div>
              <p className="text-xs text-primary-foreground/60 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              Tools built for travel growth
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From financing to analytics, everything integrates seamlessly into your workflow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-6 rounded-2xl border bg-card hover:shadow-card transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-accent-foreground" />
                </div>
                <h3 className="font-heading font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gated tool teaser */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-secondary/15 rounded-full px-4 py-1.5">
            <span className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Partner Only</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Itinerary Optimizer</h2>
          <p className="text-muted-foreground text-lg">
            Upload an itinerary and get AI-powered suggestions to make it more competitive — 
            better pricing, smarter bundling, higher margins. Available exclusively to SanKash partners.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/contact">
              <Button size="lg" className="gap-2">Become a Partner <ArrowRight size={16} /></Button>
            </Link>
            <Button variant="outline" size="lg">Agent Login</Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForAgents;
