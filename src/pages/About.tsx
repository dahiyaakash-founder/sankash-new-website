import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.45 },
};

const whoUses = [
  { label: "Travel agents & agencies", desc: "Offer financing, attach protection, and collect faster on every booking." },
  { label: "OTAs & platforms", desc: "Embed lending, insurance, and payments via API or checkout flows." },
  { label: "Distribution partners", desc: "Add SanKash products into existing travel workflows and earn on every transaction." },
  { label: "Travelers", desc: "Access No Cost EMI, protection products, and smarter payment options through their agent or platform." },
];

const capabilities = [
  { label: "Travel distribution understanding", desc: "Built by people who have worked inside OTAs, travel agencies, and partner distribution networks — and understand how bookings actually move." },
  { label: "Financial infrastructure expertise", desc: "Lending, insurance, and payments systems designed from first principles around travel economics — not adapted from retail or e-commerce." },
  { label: "Product & integration focus", desc: "API-led architecture and checkout flows designed to fit into real booking systems, with minimal integration effort." },
  { label: "Operations that scale", desc: "Settlement cycles, compliance workflows, and partner operations built to handle volume without breaking." },
];

const About = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="Travel Financial Infrastructure for Travel Businesses | SanKash"
        description="SanKash was built because travel deserved its own financial layer. Learn why lending, insurance, and payments needed a travel-first platform."
      />
      {/* Hero */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Why SanKash</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight text-primary-deep">
              Travel needed a financial layer.<br />We built it.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Most financial products are built for retail, e-commerce, or general-purpose businesses. 
              Travel has different economics — variable pricing, advance bookings, split payments, 
              multi-party settlements, and customers who need financing at the moment of decision. 
              SanKash exists because travel deserved its own infrastructure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The gap */}
      <section className="py-20 md:py-28">
        <div className="container max-w-3xl">
          <motion.div {...fade} className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-deep">
              The problem we saw
            </h2>
            <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
              <p>
                Travel agents lose bookings because customers can't afford the full cost upfront. 
                OTAs lose conversion because checkout doesn't offer real financing. 
                Travelers delay trips because they don't know what's possible.
              </p>
              <p>
                Generic lending products don't understand travel workflows. 
                General-purpose payment gateways don't handle travel's settlement complexity. 
                And nobody was embedding insurance at the point of booking in a way that actually worked for agents.
              </p>
              <p className="text-foreground font-medium">
                SanKash was built from the ground up to solve this — not by adapting retail 
                fintech, but by building financial infrastructure specifically for how travel businesses operate.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container max-w-4xl">
          <motion.div {...fade} className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-deep">
              What makes SanKash different
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                { q: "Travel-first, not adapted", a: "Every product decision — lending logic, settlement cycles, checkout flows — starts with how travel businesses actually work." },
                { q: "Three products, one platform", a: "Lending, Insurance, and Payments run as a single integrated layer. Agents don't need three separate vendors." },
                { q: "Built for agents, not just consumers", a: "Most fintech targets the end consumer. SanKash is built for the agent and business that serves the consumer." },
                { q: "Real integration, not just a widget", a: "API-led and checkout-linked flows that fit into existing booking systems, not bolted-on afterthoughts." },
              ].map((item, i) => (
                <motion.div
                  key={item.q}
                  {...fade}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h3 className="text-base font-heading font-bold text-foreground">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who uses SanKash */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl">
          <motion.div {...fade} className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-deep">
              Who uses SanKash
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {whoUses.map((item, i) => (
                <motion.div
                  key={item.label}
                  {...fade}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="rounded-xl border bg-card p-6 space-y-2"
                >
                  <h3 className="text-sm font-heading font-bold text-foreground">{item.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust stats — sparse */}
      <section className="py-12 md:py-14 bg-brand-deep">
        <div className="container">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
            {[
              { v: "8,000+", l: "Active Partners" },
              { v: "5 Million+", l: "Travelers Served" },
              { v: "T+1", l: "Settlement Cycle" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground">{s.v}</div>
                <p className="text-[11px] text-primary-foreground/50 uppercase tracking-wider mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl">
          <motion.div {...fade} className="space-y-10">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-deep">
                Built by people who know travel
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                SanKash was founded in 2018 by a team that spent years inside travel companies and 
                financial institutions — and understood that neither side had built the right bridge.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {capabilities.map((c, i) => (
                <motion.div key={c.label} {...fade} transition={{ delay: i * 0.07, duration: 0.4 }} className="space-y-1.5">
                  <h3 className="text-sm font-heading font-bold text-foreground">{c.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-section-alt">
        <motion.div {...fade} className="container max-w-2xl text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-deep">
            See how SanKash works for your business
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" asChild>
              <Link to="/solutions">Explore Solutions</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Book a Demo <ArrowRight size={14} /></Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
};

export default About;
