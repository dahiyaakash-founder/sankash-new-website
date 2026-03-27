import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Webhook, Key, FileJson, Zap, BookOpen } from "lucide-react";

const apiProducts = [
  { icon: FileJson, title: "Lending API", desc: "Embed travel financing directly into your checkout. Instant eligibility checks, EMI options, and disbursement." },
  { icon: Webhook, title: "Insurance API", desc: "Programmatically offer travel insurance with real-time quote generation and policy issuance." },
  { icon: Key, title: "Payments API", desc: "Accept payments, manage settlements, and automate reconciliation through a single integration." },
];

const Developers = () => {
  return (
    <SiteLayout>
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Code2 size={28} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Developers</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              Build with SanKash APIs
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Integrate lending, insurance, and payment products into your platform with 
              well-documented RESTful APIs. Ship faster, scale confidently.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="xl" className="gap-2">
                <BookOpen size={18} /> View API Docs
              </Button>
              <Link to="/contact">
                <Button variant="outline" size="xl" className="gap-2">
                  Get API Access <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* API Products */}
      <section className="py-20 md:py-28">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-14">API Products</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {apiProducts.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-8 rounded-2xl border bg-card space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <p.icon size={22} className="text-accent-foreground" />
                </div>
                <h3 className="text-lg font-heading font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code snippet preview */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold">Simple integration</h2>
            <p className="mt-3 text-muted-foreground">A few lines of code to get started.</p>
          </div>
          <div className="bg-slate-deep rounded-2xl p-6 md:p-8 overflow-x-auto">
            <pre className="text-sm text-emerald-glow font-mono leading-relaxed">
{`// Initialize SanKash SDK
const sankash = new SanKash({
  apiKey: 'sk_live_...',
  environment: 'production'
});

// Check EMI eligibility
const eligibility = await sankash.lending.checkEligibility({
  amount: 150000,
  currency: 'INR',
  customer: { phone: '+91...' }
});

// Get available EMI plans
const plans = eligibility.plans;
// → [{ tenure: 3, emi: 50000, interest: 0 }, ...]`}
            </pre>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Zap size={14} className="text-primary" /> RESTful APIs</span>
            <span className="flex items-center gap-2"><Zap size={14} className="text-primary" /> Webhooks</span>
            <span className="flex items-center gap-2"><Zap size={14} className="text-primary" /> SDKs</span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Developers;
