import SiteLayout from "@/components/SiteLayout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";

const solutions = [
  {
    icon: Banknote,
    label: "Lending",
    title: "Travel Now, Pay Later",
    desc: "Offer flexible EMI and BNPL options at the point of sale. Instant credit decisions. Higher ticket sizes. Better customer experience.",
    features: ["No Cost EMI", "Instant approval", "Multiple lender partners", "Zero paperwork"],
    href: "/solutions/lending",
    gradient: "from-primary/5 to-emerald-glow/5",
  },
  {
    icon: ShieldCheck,
    label: "Insurance",
    title: "Travel Protection, Built In",
    desc: "Embed comprehensive travel insurance directly into your booking flow. Trip cancellation, medical, baggage — all covered.",
    features: ["Embedded checkout", "Multiple coverage plans", "Claims support", "Ancillary revenue"],
    href: "/solutions/insurance",
    gradient: "from-secondary/5 to-amber-glow/5",
  },
  {
    icon: CreditCard,
    label: "Payments",
    title: "Seamless Settlement Infrastructure",
    desc: "Get paid in T+1. Accept all payment modes. Transparent reconciliation. Built for travel's unique settlement needs.",
    features: ["T+1 settlement", "All payment modes", "Auto-reconciliation", "Real-time tracking"],
    href: "/solutions/payments",
    gradient: "from-accent to-primary/5",
  },
];

const Solutions = () => {
  return (
    <SiteLayout>
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl text-center space-y-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">Solutions</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
            One platform, three growth engines
          </h1>
          <p className="text-lg text-muted-foreground">
            Lending, Insurance, and Payments — each designed specifically for travel, all integrated into one platform.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container space-y-12">
          {solutions.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={s.href}
                className={`group block p-8 md:p-12 rounded-2xl border bg-gradient-to-br ${s.gradient} hover:shadow-card-hover transition-all`}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <s.icon size={22} className="text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold">{s.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      Learn more <ArrowRight size={14} />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {s.features.map((f) => (
                      <div key={f} className="px-4 py-3 rounded-xl bg-background/80 border text-sm font-medium text-center">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Solutions;
