import { motion } from "framer-motion";
import { Users, ArrowLeftRight, Plane, FileCheck } from "lucide-react";

const proofPoints = [
  { icon: Users, value: "10,000+", label: "Active Partners" },
  { icon: ArrowLeftRight, value: "T+1", label: "Settlement Cycle" },
  { icon: Plane, value: "5 Million+", label: "Travelers Served" },
  { icon: FileCheck, value: "₹200Cr+", label: "Payment Volume Enabled" },
];

const TrustBar = () => {
  return (
    <section className="py-6 md:py-12 border-b bg-brand-deep">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {proofPoints.map((point, i) => (
            <motion.div
              key={point.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <point.icon size={18} className="text-primary-foreground/60" />
              </div>
              <div>
                <div className="text-lg font-heading font-bold text-primary-foreground">{point.value}</div>
                <p className="text-[11px] text-primary-foreground/40 uppercase tracking-wider">{point.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
