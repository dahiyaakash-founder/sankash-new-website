import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Zap, BarChart3, ArrowRight } from "lucide-react";

const AgentValueProp = () => {
  return (
    <section className="py-20 md:py-28 bg-section-alt">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.1em]">For Travel Agents</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep leading-tight">
              Convert more bookings.<br />
              Collect payments faster.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              SanKash gives travel agents, OTAs, and distribution partners the financial tools to 
              close more sales. Offer financing at checkout. Settle in T+1. Earn on every transaction.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                { icon: TrendingUp, text: "40% higher conversion with point-of-sale financing" },
                { icon: Zap, text: "Go live in days — single API or no-code integration" },
                { icon: BarChart3, text: "Real-time dashboard for bookings, revenue & settlements" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>

            <Link to="/for-agents">
              <Button size="lg" className="gap-2 text-sm mt-2">
                Explore Agent Solutions <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: "8,000+", label: "Active Partners", border: "border-primary/15" },
              { value: "T+1", label: "Settlement Cycle", border: "border-brand-green/20" },
              { value: "40%", label: "Conversion Lift", border: "border-primary/15" },
              { value: "20%", label: "More Inquiries", border: "border-brand-green/20" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`p-5 rounded-xl border ${stat.border} bg-card text-center`}
              >
                <div className="text-2xl md:text-3xl font-heading font-bold text-primary-deep">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AgentValueProp;
