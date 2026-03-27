import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroAbstract from "@/assets/hero-abstract.jpg";

const HomepageCTA = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroAbstract} alt="" className="w-full h-full object-cover" loading="lazy" width={1920} height={1080} />
        <div className="absolute inset-0 bg-slate-deep/80" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-6"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-background tracking-tight">
            Ready to power your travel growth?
          </h2>
          <p className="text-background/60 text-lg">
            Join 8,000+ travel businesses already using SanKash to sell more, convert faster, and grow.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/contact">
              <Button variant="amber" size="xl" className="gap-2">
                Book a Demo <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/developers">
              <Button variant="ghost-dark" size="xl" className="gap-2">
                View API Docs <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomepageCTA;
