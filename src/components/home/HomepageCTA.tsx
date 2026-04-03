import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AGENT_SIGNUP_URL } from "@/lib/constants";
import { trackGetStartedAgentClick, trackBookDemoClick } from "@/lib/analytics";
import { Link } from "react-router-dom";

const HomepageCTA = () => {
  return (
    <section className="relative py-12 md:py-28 bg-brand-deep overflow-hidden">
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
            Ready to get started?
          </h2>
          <p className="text-primary-foreground/50 text-base">
            Whether you're a traveler exploring EMI options or a travel business looking to grow — 
            SanKash has you covered.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link to="/for-travelers">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm font-semibold">
                Check Holiday EMI <ArrowRight size={16} />
              </Button>
            </Link>
            <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackGetStartedAgentClick({ cta_location: "bottom_cta" })}>
              <Button size="lg" className="text-sm font-semibold bg-primary-foreground text-brand-deep hover:bg-primary-foreground/90 gap-2">
                Get Started as an Agent <ArrowRight size={16} />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomepageCTA;
