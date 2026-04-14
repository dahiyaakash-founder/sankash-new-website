import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, Calculator, Compass, ArrowRight } from "lucide-react";

const paths = [
  {
    icon: Upload,
    title: "Review Your Quote",
    desc: "Upload a quote or itinerary from any travel agent. Get a free review with EMI options.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calculator,
    title: "Check Your EMI",
    desc: "See what your holiday costs per month — No Cost EMI on short tenures, no credit score impact.",
    color: "text-brand-coral",
    bgColor: "bg-brand-coral/10",
  },
  {
    icon: Compass,
    title: "Build My Trip",
    desc: "Shape a holiday from ideas, inspiration, or a destination. Bring your saved travel ideas — we'll help plan and price.",
    color: "text-brand-green",
    bgColor: "bg-brand-green/10",
  },
];

const TravelerTeaser = () => {
  return (
    <section className="py-12 md:py-28">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3 mb-7 md:mb-12"
          >
            <p className="text-[11px] font-semibold text-brand-coral uppercase tracking-[0.1em]">For Travelers</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              Your smarter start to every holiday
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Review a quote. Check what it costs per month. Or shape a trip from scratch.
              Three ways to plan, refine, and finance your next holiday.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {paths.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="p-4 sm:p-5 rounded-xl border bg-card hover:shadow-card transition-shadow space-y-2.5"
              >
                <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <h3 className="text-base font-heading font-bold text-primary-deep">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-7 md:mt-8">
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
