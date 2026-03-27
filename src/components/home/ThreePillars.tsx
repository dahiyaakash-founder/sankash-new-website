import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Banknote,
    label: "Lending",
    title: "Finance travel at the point of sale",
    desc: "Offer No Cost EMI, BNPL, and instant credit to customers. Increase ticket sizes, close more bookings, and get higher conversion from every inquiry.",
    metrics: ["<60s approval", "15+ lender partners", "0% EMI options"],
    href: "/solutions/lending",
  },
  {
    icon: ShieldCheck,
    label: "Insurance",
    title: "Monetise protection on every booking",
    desc: "Embed travel insurance directly into your checkout. Generate ancillary revenue per transaction while giving travelers the coverage they need.",
    metrics: ["Embedded checkout", "Multiple underwriters", "Claims support"],
    href: "/solutions/insurance",
  },
  {
    icon: CreditCard,
    label: "Payments",
    title: "Collect faster. Settle in T+1",
    desc: "Accept every payment mode. Get settled the next business day. Automated reconciliation and GST-compliant invoicing — built for travel's complexity.",
    metrics: ["T+1 settlement", "All payment modes", "Auto reconciliation"],
    href: "/solutions/payments",
  },
];

const ThreePillars = () => {
  return (
    <section className="py-20 md:py-28">
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
                className="group block p-6 md:p-8 rounded-2xl border bg-card hover:shadow-card-hover hover:border-primary/15 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
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

                  <div className="flex md:flex-col gap-2 md:gap-2 md:min-w-[180px]">
                    {pillar.metrics.map((m) => (
                      <div key={m} className="px-3 py-2 rounded-lg bg-muted text-[12px] font-medium text-center whitespace-nowrap">
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
