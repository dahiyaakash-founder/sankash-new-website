import { useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <SiteLayout>
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl text-center space-y-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">Contact Us</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
            Let's grow your travel business
          </h1>
          <p className="text-lg text-muted-foreground">
            Book a demo, ask a question, or explore how SanKash can work for you.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="p-12 rounded-2xl border bg-accent text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Thank you!</h3>
                  <p className="text-muted-foreground">We'll be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-2xl font-heading font-bold mb-2">Book a Demo</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">First Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Last Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Work Email</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Company</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">I am a...</label>
                    <select className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Travel Agent / OTA</option>
                      <option>Distribution Partner</option>
                      <option>Developer / Integration Partner</option>
                      <option>Traveler</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message</label>
                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2">
                    Submit <ArrowRight size={16} />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-heading font-bold">Get in touch</h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Email", value: "hello@sankash.in" },
                  { icon: Phone, label: "Phone", value: "+91 (support line)" },
                  { icon: MapPin, label: "Office", value: "Gurugram, Haryana, India" },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <c.icon size={18} className="text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="text-sm font-medium">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl border bg-accent/50 space-y-3 mt-8">
                <h4 className="text-sm font-heading font-bold">Already a partner?</h4>
                <p className="text-xs text-muted-foreground">
                  Access your dashboard and tools through the agent portal.
                </p>
                <Button variant="outline-primary" size="sm">Agent Login</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
