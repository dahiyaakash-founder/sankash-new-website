import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SecondaryPaths = () => {
  return (
    <section className="py-10 md:py-20">
      <div className="container">
        <div className="max-w-lg mb-8 md:mb-10">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.1em] mb-3">Also on SanKash</p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary-deep">
            For platforms and integrations
          </h2>
        </div>

        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="group flex flex-col h-full rounded-2xl border bg-card p-5 sm:p-7 hover:shadow-card-hover hover:border-primary/15 transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Code2 size={20} />
              </div>
              <h3 className="text-lg font-heading font-bold text-primary-deep mb-2">For Developers & Platforms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Integrate lending, insurance, and payments via API. Clean docs, sandbox access, and production-ready SDKs for OTAs, DMCs, and travel platforms.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <a href="https://docs.sankash.in" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs gap-1 border-primary/20 text-primary">
                    View Docs <ArrowRight size={12} />
                  </Button>
                </a>
                <Link to="/developers">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    Get Sandbox Access
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecondaryPaths;
