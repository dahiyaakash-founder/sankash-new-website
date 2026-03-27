import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import platformMockup from "@/assets/platform-mockup.jpg";

const HomepageHero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="container py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-accent-foreground tracking-wide uppercase">
                India's Travel Growth Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-heading font-bold leading-[1.1] tracking-tight">
              Three growth engines{" "}
              <span className="text-gradient-primary">for travel businesses</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              SanKash powers your travel business with integrated Lending, Insurance, and Payments — 
              so you can sell more, convert faster, and grow confidently.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/contact">
                <Button size="xl" className="gap-2">
                  Book a Demo <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/solutions">
                <Button variant="outline" size="xl" className="gap-2">
                  <Play size={16} /> See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust signal */}
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-glow" />
                8,000+ Travel Partners
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                500K+ Travelers Served
              </span>
            </div>
          </motion.div>

          {/* Right — Product visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl blur-3xl" />
            <img
              src={platformMockup}
              alt="SanKash platform dashboard"
              className="relative rounded-2xl shadow-card-hover w-full"
              width={1200}
              height={800}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
