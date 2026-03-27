import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Calculator, CreditCard, Shield, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload Your Quote", desc: "Share your trip itinerary or quote from any travel agent." },
  { icon: Calculator, title: "See EMI Options", desc: "Get indicative monthly payment plans including No Cost EMI options." },
  { icon: CheckCircle2, title: "Get Expert Review", desc: "Our team reviews your trip for potential value improvements." },
];

const ForTravelers = () => {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest">For Travelers</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
              Your dream trip, made <span className="text-gradient-warm">affordable</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Explore flexible payment plans, No Cost EMI, and smarter ways to book your next adventure. 
              Upload a quote and see your options — no commitment required.
            </p>
            <Link to="/contact">
              <Button size="xl" variant="amber" className="gap-2">
                Upload a Trip Quote <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-14">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto">
                  <step.icon size={24} className="text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-sm font-bold font-heading">
                  {i + 1}
                </div>
                <h3 className="text-lg font-heading font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-section-alt">
        <div className="container max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border bg-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard size={22} className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold">No Cost EMI</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Split your trip cost into easy monthly payments at zero extra cost. 
                Available across popular banks and payment providers.
              </p>
            </div>
            <div className="p-8 rounded-2xl border bg-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center">
                <Shield size={22} className="text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-heading font-bold">Travel Protection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Comprehensive travel insurance that covers trip cancellation, medical emergencies, 
                baggage loss, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-background">
        <div className="container max-w-2xl text-center">
          <p className="text-xs text-muted-foreground">
            * EMI options and savings shown are indicative and subject to review. Final offers depend on 
            lender approval, trip details, and agent terms. SanKash facilitates — your travel agent finalizes.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForTravelers;
