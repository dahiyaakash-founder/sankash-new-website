import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Banknote,
    label: "Lending",
    title: "Travel Now, Pay Later",
    desc: "Offer flexible EMI options at the point of sale. Instant credit decisions, zero paperwork. Help your customers afford their dream trips.",
    href: "/solutions/lending",
    accent: "from-primary/10 to-emerald-glow/10",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: ShieldCheck,
    label: "Insurance",
    title: "Travel Protection, Built In",
    desc: "Embed comprehensive travel insurance directly into your booking flow. Increase ancillary revenue with every transaction.",
    href: "/solutions/insurance",
    accent: "from-secondary/10 to-amber-glow/10",
    iconBg: "bg-secondary/15 text-secondary-foreground",
  },
  {
    icon: CreditCard,
    label: "Payments",
    title: "Seamless Settlement",
    desc: "Get paid in T+1 upon booking confirmation. No waiting, no friction. Simple, transparent payment infrastructure for travel.",
    href: "/solutions/payments",
    accent: "from-accent to-primary/5",
    iconBg: "bg-accent text-accent-foreground",
  },
];

const ThreePillars = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">The Platform</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Three pillars. One platform.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything a travel business needs to sell more and grow — integrated into one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Link
                to={pillar.href}
                className={`group block p-8 rounded-2xl border bg-gradient-to-br ${pillar.accent} hover:shadow-card-hover transition-all duration-300 h-full`}
              >
                <div className={`w-12 h-12 rounded-xl ${pillar.iconBg} flex items-center justify-center mb-5`}>
                  <pillar.icon size={22} />
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{pillar.label}</p>
                <h3 className="text-xl font-heading font-bold mb-3">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{pillar.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreePillars;
