import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, Calculator, ArrowRight } from "lucide-react";

const TravelerTeaser = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest">For Travelers</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              Explore smarter ways to travel
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload a trip quote and discover EMI options that make your dream trip more affordable. 
              No commitment — just clarity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            <div className="p-8 rounded-2xl border bg-gradient-to-br from-secondary/5 to-amber-glow/5 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center">
                <Upload size={22} className="text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-heading font-bold">Upload a Trip Quote</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Share your itinerary or quote from any travel agent. We'll show you indicative EMI 
                options and potential value improvements.
              </p>
            </div>

            <div className="p-8 rounded-2xl border bg-gradient-to-br from-primary/5 to-emerald-glow/5 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calculator size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold">See EMI Options</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a quick, indicative view of how much your trip could cost per month with 
                No Cost EMI and flexible payment plans.
              </p>
            </div>
          </motion.div>

          <div className="text-center mt-10">
            <Link to="/for-travelers">
              <Button variant="outline-primary" size="lg" className="gap-2">
                Explore Traveler Tools <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelerTeaser;
