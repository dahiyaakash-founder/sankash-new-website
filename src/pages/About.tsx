import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Target, Eye, Rocket } from "lucide-react";

const values = [
  { icon: Target, title: "Travel-First", desc: "Every product decision starts with understanding how travel businesses actually work." },
  { icon: Eye, title: "Transparency", desc: "Clear pricing, honest communication, and no hidden surprises." },
  { icon: Rocket, title: "Speed", desc: "Fast integrations, fast settlements, fast support. Time matters in travel." },
];

const About = () => {
  return (
    <SiteLayout>
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">About SanKash</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              Opening the world to everyone
            </h1>
            <p className="text-lg text-muted-foreground">
              SanKash is India's largest travel-focused financial platform. Since 2018, we've partnered 
              with travel agents to make dream vacations a reality — not just a budget fantasy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="container max-w-3xl space-y-8">
          <h2 className="text-3xl font-heading font-bold">Our Mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We believe travel shouldn't be limited by financial constraints. By bridging the gap between 
            travel and finance, we empower agents to serve more customers and help travelers explore 
            the world on their terms.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our platform combines lending, insurance, and payments into a single, purpose-built solution 
            for the travel industry — serving 8,000+ travel partners and over 500,000 travelers since our founding in 2018.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-center mb-14">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-8 rounded-2xl border bg-card text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <v.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "2018", l: "Founded" },
            { v: "8K+", l: "Travel Partners" },
            { v: "500K+", l: "Travelers Served" },
            { v: "₹500Cr+", l: "Processed" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">{s.v}</div>
              <p className="text-xs text-primary-foreground/60 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container text-center">
          <Link to="/contact">
            <Button size="xl" className="gap-2">
              Work With Us <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default About;
