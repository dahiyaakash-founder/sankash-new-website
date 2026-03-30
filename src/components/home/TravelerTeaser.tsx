import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, Calculator, Search, CreditCard, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload a Trip Quote",
    desc: "Share your itinerary or quote from any travel agent. No commitment needed.",
  },
  {
    icon: Search,
    title: "Explore Better Value",
    desc: "See if there's room for improvement — we'll flag where you could be getting more.",
  },
  {
    icon: Calculator,
    title: "Check EMI Options",
    desc: "Get indicative monthly costs with No Cost EMI — quick, transparent, no surprises.",
  },
  {
    icon: CreditCard,
    title: "Get Finance-Ready",
    desc: "Know your options before you book. Walk into any agent prepared and confident.",
  },
];

const TravelerTeaser = () => {
  return (
    <section className="py-14 md:py-28">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 mb-12"
          >
            <p className="text-[11px] font-semibold text-brand-coral uppercase tracking-[0.1em]">For Travelers</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              Know your options before you book
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload a trip quote. Explore whether there's scope for better value. 
              Check what your trip could cost per month. Get finance-ready — before you commit.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {steps.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="p-6 rounded-xl border bg-card hover:shadow-card transition-shadow space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-coral/10 flex items-center justify-center">
                    <card.icon size={18} className="text-brand-coral" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="text-base font-heading font-bold text-primary-deep">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/for-travelers">
              <Button variant="outline" size="lg" className="gap-2 text-sm border-primary/20 text-primary hover:bg-accent">
                Explore Traveler Tools <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelerTeaser;
