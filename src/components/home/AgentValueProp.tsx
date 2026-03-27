import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Users, ArrowRight } from "lucide-react";

const benefits = [
  { icon: Zap, text: "Go live in days, not months" },
  { icon: TrendingUp, text: "40% higher booking conversion" },
  { icon: Users, text: "Dedicated partner success team" },
];

const AgentValueProp = () => {
  return (
    <section className="py-20 md:py-28 bg-section-alt">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — value copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">For Travel Agents</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight leading-tight">
              Sell more. Get paid faster.{" "}
              <span className="text-gradient-primary">Grow your business.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              SanKash gives travel agents the tools to offer financing, insurance, and seamless payments 
              to their customers — all from a single integration. No heavy tech lift required.
            </p>

            <ul className="space-y-4">
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link to="/for-agents">
                <Button size="lg" className="gap-2">
                  Explore Agent Solutions <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right — stats grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: "8K+", label: "Active Travel Partners", accent: "border-primary/20 bg-primary/5" },
              { value: "T+1", label: "Settlement Cycle", accent: "border-secondary/20 bg-secondary/5" },
              { value: "500K+", label: "Travelers Served", accent: "border-primary/20 bg-primary/5" },
              { value: "20%", label: "More Inquiries", accent: "border-secondary/20 bg-secondary/5" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`p-6 rounded-2xl border ${stat.accent} text-center`}
              >
                <div className="text-3xl md:text-4xl font-heading font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AgentValueProp;
