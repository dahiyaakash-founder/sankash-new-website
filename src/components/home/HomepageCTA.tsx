import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HomepageCTA = () => {
  return (
    <section className="relative py-12 md:py-28 bg-brand-deep overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(hsl(189 99% 35%) 1px, transparent 1px), linear-gradient(90deg, hsl(189 99% 35%) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary-foreground tracking-tight">
            Ready to grow your travel business?
          </h2>
          <p className="text-primary-foreground/50 text-base">
            Turn quote review, EMI, protection, and collections into one cleaner booking workflow for your travel business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link to="/solutions">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm font-semibold">
                Explore Solutions <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost-dark" size="lg" className="text-sm font-semibold">
                Book a Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomepageCTA;
