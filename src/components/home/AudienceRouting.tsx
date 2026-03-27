import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Plane, Code2, ArrowRight } from "lucide-react";

const audiences = [
  {
    icon: Briefcase,
    title: "For Travel Agents",
    desc: "Grow bookings with lending, earn from insurance, and get settled in T+1. Tools built for how agents actually sell.",
    href: "/for-agents",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Plane,
    title: "For Travelers",
    desc: "Upload a trip quote, explore EMI options, and see if there's scope for better value — before you commit.",
    href: "/for-travelers",
    accent: "bg-brand-green/10 text-brand-green",
  },
  {
    icon: Code2,
    title: "For Developers",
    desc: "Integrate lending, insurance, and payments via API. Clean docs, sandbox access, and production-ready SDKs.",
    href: "/developers",
    accent: "bg-brand-coral/10 text-brand-coral",
  },
];

const AudienceRouting = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="max-w-lg mb-10">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.1em] mb-3">Who it's for</p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary-deep">
            Find your path
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={a.href}
                className="group flex flex-col h-full p-6 rounded-2xl border bg-card hover:shadow-card-hover hover:border-primary/15 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl ${a.accent} flex items-center justify-center mb-5`}>
                  <a.icon size={20} />
                </div>
                <h3 className="text-lg font-heading font-bold text-primary-deep mb-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{a.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-4 group-hover:gap-2.5 transition-all">
                  Get started <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceRouting;
