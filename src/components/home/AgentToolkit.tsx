import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Banknote, FileSearch, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";
import { AGENT_SIGNUP_URL } from "@/lib/constants";
import { trackAgentSignupClick } from "@/lib/analytics";

const tools = [
  {
    icon: Banknote,
    title: "No Cost EMI at checkout",
    desc: "Let customers pay for holidays in monthly instalments. Travelers get affordability; agents close 20% more bookings.",
    proof: "20% sales lift · 40% conversion",
    accent: "bg-primary/8 border-primary/12",
  },
  {
    icon: FileSearch,
    title: "Holiday quote review",
    desc: "Upload any itinerary — whether you're a traveler checking value or an agent optimising before the pitch.",
    proof: "AI-powered analysis in seconds",
    accent: "bg-brand-green/8 border-brand-green/12",
  },
  {
    icon: ShieldCheck,
    title: "Travel protection",
    desc: "Cancellation, medical, and baggage cover embedded at checkout — giving travelers confidence and agents ancillary revenue.",
    proof: "Ancillary revenue per booking",
    accent: "bg-brand-coral/8 border-brand-coral/12",
  },
  {
    icon: CreditCard,
    title: "Faster payments & settlement",
    desc: "Every payment mode accepted. Next-day settlement for agents. Clean reconciliation for the entire travel chain.",
    proof: "T+1 settlement · ₹200Cr+ volume",
    accent: "bg-primary/8 border-primary/12",
  },
];

const AgentToolkit = () => {
  return (
    <section className="py-12 md:py-28 bg-section-alt">
      <div className="container">
        <div className="max-w-2xl mb-8 md:mb-14">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.1em] mb-3">
            What SanKash does
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
            Four capabilities across the booking journey
          </h2>
          <p className="mt-4 text-muted-foreground">
            Whether you're a traveler exploring EMI options or a travel business growing revenue — 
            SanKash powers the financial layer of the trip.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`rounded-2xl border p-5 md:p-7 ${tool.accent} hover:shadow-card-hover transition-all`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-card">
                  <tool.icon size={20} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {tool.proof}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-heading font-bold text-primary-deep mb-2">{tool.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 md:mt-10">
          <Link to="/for-travelers">
            <Button variant="outline" size="lg" className="gap-2 text-sm font-semibold border-primary/25 text-primary">
              I'm a traveler <ArrowRight size={16} />
            </Button>
          </Link>
          <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAgentSignupClick({ cta_location: "agent_toolkit" })}>
            <Button size="lg" className="gap-2 text-sm font-semibold">
              Get Started as an Agent <ArrowRight size={16} />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AgentToolkit;
