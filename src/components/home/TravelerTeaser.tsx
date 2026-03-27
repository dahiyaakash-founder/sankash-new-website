import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, Calculator, ArrowRight } from "lucide-react";

const TravelerTeaser = () => {
  return (
    <section className="py-20 md:py-28">
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
              See what your trip could cost per month
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload a trip quote from any agent. Get indicative EMI options and 
              a review of where there may be room for better value. No commitment.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Upload,
                title: "Upload a Trip Quote",
                desc: "Share your itinerary or quote. We'll show indicative financing options and flag potential improvements.",
              },
              {
                icon: Calculator,
                title: "Explore EMI Options",
                desc: "See how much your trip could cost per month with No Cost EMI. Quick, indicative, transparent.",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                className="p-6 rounded-xl border bg-card space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <card.icon size={20} className="text-primary" />
                </div>
                <h3 className="text-base font-heading font-bold">{card.title}</h3>
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
