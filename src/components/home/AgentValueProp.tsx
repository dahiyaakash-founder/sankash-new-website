import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileSearch, TrendingUp, Zap, ArrowRight } from "lucide-react";

const proofBlocks = [
  {
    eyebrow: "No Cost EMI",
    title: "3 & 6 months",
    detail: "Let customers book in monthly instalments right at checkout.",
  },
  {
    eyebrow: "Commercial lift",
    title: "20% sales lift · 40% better conversion",
    detail: "Turn bigger itineraries into bookable trips with financing-led sales support.",
  },
  {
    eyebrow: "Checkout protection",
    title: "Medical, cancellation, baggage",
    detail: "Attach protection at checkout instead of chasing add-ons after the quote is sent.",
  },
  {
    eyebrow: "Collections",
    title: "T+1 settlement · lower payment friction",
    detail: "Get settled the next business day with cleaner collection and reconciliation flows.",
  },
];

const AgentValueProp = () => {
  return (
    <section className="py-12 md:py-28 bg-brand-deep relative overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4 md:space-y-6"
          >
            <p className="text-[11px] font-semibold text-primary-foreground/50 uppercase tracking-[0.1em]">For Travel Agents</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-foreground leading-tight">
              Review your itinerary<br />
              before you send it.
            </h2>
            <p className="text-primary-foreground/50 leading-relaxed">
              Upload a quote or itinerary and see how to make it more competitive — 
              with financing options, embedded insurance, and smarter pricing signals. 
              SanKash helps agents sell smarter, not just collect faster.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                { icon: FileSearch, text: "Upload any itinerary — get competitive improvement suggestions" },
                { icon: TrendingUp, text: "20% sales lift, 40% better conversion, and 200% more customer queries with travel EMI" },
                { icon: Zap, text: "Go live in days — single API or no-code dashboard" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary-foreground/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-primary-foreground/60" />
                  </div>
                  <span className="text-sm font-medium text-primary-foreground/70">{text}</span>
                </li>
              ))}
            </ul>

            <Link to="/for-travel-agents">
              <Button size="lg" className="gap-2 text-sm mt-2 bg-primary-foreground text-primary-deep hover:bg-primary-foreground/90">
                Upload a Quote <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {proofBlocks.map((stat, index) => (
              <div
                key={stat.title}
                className={`rounded-xl border p-4 text-left ${index % 2 === 0 ? 'bg-primary-foreground/10 border-primary-foreground/10' : 'bg-primary-foreground/5 border-primary-foreground/5'}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/40">{stat.eyebrow}</p>
                <div className="mt-2 text-base md:text-lg font-heading font-bold leading-snug text-primary-foreground">{stat.title}</div>
                <p className="mt-2 text-[12px] leading-relaxed text-primary-foreground/60">{stat.detail}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AgentValueProp;
