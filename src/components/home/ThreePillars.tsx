import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Banknote,
    label: "Lending",
    title: "Offer No Cost EMI at checkout",
    desc: "Help customers book holidays in monthly instalments and unlock stronger conversion for every booking.",
    metrics: ["20% sales lift", "40% better conversion", "200% more queries"],
    href: "/solutions/lending",
    accent: "bg-primary/8 border-primary/12",
  },
  {
    icon: ShieldCheck,
    label: "Insurance",
    title: "Monetise protection on every booking",
    desc: "Embed travel insurance directly into your checkout. Generate ancillary revenue per transaction while giving travelers the coverage they need.",
    metrics: ["Embedded checkout", "Multiple underwriters", "Claims support"],
    href: "/solutions/insurance",
    accent: "bg-brand-green/8 border-brand-green/12",
  },
  {
    icon: CreditCard,
    label: "Payments",
    title: "Collect faster. Settle in T+1",
    desc: "Accept every payment mode. Get settled the next business day. Automated reconciliation and GST-compliant invoicing — built for travel's complexity.",
    metrics: ["T+1 settlement", "All payment modes", "Auto reconciliation"],
    href: "/solutions/payments",
    accent: "bg-brand-coral/8 border-brand-coral/12",
  },
];

const ThreePillars = () => {
  return (
    <section className="py-20 md:py-28 bg-section-alt">
      <div className="container">
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.1em] mb-3">Platform</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
            Three growth engines. One platform.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each product is purpose-built for travel — not adapted from generic fintech. 
            Integrate one, or run all three.
          </p>
        </div>

        <div className="space-y-4">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link
                to={pillar.href}
                className={`group block p-6 md:p-8 rounded-2xl border ${pillar.accent} hover:shadow-card-hover transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-card">
                        <pillar.icon size={20} className="text-primary" />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                        {pillar.label}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-primary-deep">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{pillar.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all pt-1">
                      Learn more <ArrowRight size={14} />
                    </span>
                  </div>

                  <div className="flex flex-wrap md:flex-col gap-2 md:gap-2 md:min-w-[180px]">
                    {pillar.metrics.map((m) => (
                      <div key={m} className="px-3 py-2 rounded-lg bg-card border text-[12px] font-medium text-center whitespace-nowrap shadow-sm">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreePillars;
