import { useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  FileText,
  Users,
  Code,
  Calendar,
  Headphones,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import SanKashAssistant from "@/components/contact/SanKashAssistant";

const quickActions = [
  {
    icon: FileText,
    label: "Review a holiday quote",
    description: "Upload an itinerary and get instant observations",
    link: "/for-travelers",
  },
  {
    icon: Users,
    label: "Ask about agent onboarding",
    description: "Learn how to start offering SanKash to your customers",
    link: "/for-travel-agents",
  },
  {
    icon: Code,
    label: "Get integration help",
    description: "API docs, sandbox access, and technical guidance",
    link: "/developers",
  },
  {
    icon: Calendar,
    label: "Book a demo",
    description: "See SanKash in action with a guided walkthrough",
    href: "#demo-form",
  },
  {
    icon: Headphones,
    label: "Get support",
    description: "Reach the right team for an existing issue",
    href: "#escalation",
  },
];

const escalationPaths = [
  {
    title: "Sales & demos",
    description: "Explore how SanKash fits your travel business",
    cta: "Book a demo",
    href: "#demo-form",
  },
  {
    title: "Support",
    description: "Help with an existing integration or account",
    cta: "Reach support",
    href: "mailto:support@sankash.in",
  },
  {
    title: "Integrations",
    description: "Technical guidance for API and checkout setup",
    cta: "View docs",
    link: "/developers",
  },
  {
    title: "Existing partners",
    description: "Dashboard access, settlement queries, account help",
    cta: "Agent login",
    href: "#",
  },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl text-center space-y-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">
            Contact
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
            How can SanKash help right now?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get instant guidance, book a demo, ask a question, or reach the
            right team — without waiting.
          </p>
        </div>
      </section>

      {/* Quick action cards */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, i) => {
              const Inner = (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group relative p-5 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                      <action.icon size={18} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold font-heading group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="absolute top-5 right-5 text-muted-foreground/40 group-hover:text-primary transition-colors"
                  />
                </motion.div>
              );

              if (action.link) {
                return (
                  <Link key={action.label} to={action.link} className="block">
                    {Inner}
                  </Link>
                );
              }
              return (
                <a key={action.label} href={action.href} className="block">
                  {Inner}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* SanKash Assistant section */}
      <section className="py-16 md:py-20 bg-accent/40">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-10 rounded-2xl border bg-card space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Sparkles size={12} />
                Smart guide
              </div>
              <h2 className="text-2xl font-heading font-bold">
                SanKash Assistant
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
                Understand products, find the right next step, or get routed
                to onboarding, demos, support, or integrations — instantly.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 max-w-lg mx-auto">
              {[
                "I'm a travel agent, where do I start?",
                "I want to understand EMI options",
                "I need sandbox access",
                "I need help with an existing issue",
              ].map((prompt) => (
                <button
                  key={prompt}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-background text-left text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200"
                >
                  <MessageSquare size={13} className="text-primary shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>

            <div className="text-center pt-1">
              <Button size="lg" className="gap-2">
                <MessageSquare size={16} />
                Start a conversation
              </Button>
              <p className="text-[11px] text-muted-foreground mt-2.5">
                Coming soon — in the meantime, use the quick actions above or the form below.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Escalation paths */}
      <section id="escalation" className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-heading font-bold">
              Reach the right team
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Choose the path that fits your need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {escalationPaths.map((path, i) => (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="p-5 rounded-2xl border bg-card space-y-3"
              >
                <h3 className="text-sm font-heading font-bold">{path.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {path.description}
                </p>
                {path.link ? (
                  <Link to={path.link}>
                    <Button variant="outline-primary" size="sm" className="gap-1.5 text-xs">
                      {path.cta} <ExternalLink size={12} />
                    </Button>
                  </Link>
                ) : (
                  <a href={path.href}>
                    <Button variant="outline-primary" size="sm" className="gap-1.5 text-xs">
                      {path.cta} <ArrowRight size={12} />
                    </Button>
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplified fallback form + contact info */}
      <section id="demo-form" className="py-16 md:py-20 bg-accent/40">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="p-10 rounded-2xl border bg-card text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">
                    Thank you!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    We'll be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="p-8 rounded-2xl border bg-card space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-heading font-bold">
                      Prefer a form? We'll get back fast.
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Book a demo, ask a question, or tell us what you need.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        Work Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        Company
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      I am a...
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Travel Agent / OTA</option>
                      <option>Distribution Partner</option>
                      <option>Developer / Integration Partner</option>
                      <option>Traveler</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2">
                    Submit <ArrowRight size={16} />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Contact info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-heading font-bold">Direct contact</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@sankash.in" },
                  { icon: Phone, label: "Phone", value: "+91 (support line)" },
                  {
                    icon: MapPin,
                    label: "Office",
                    value: "Gurugram, Haryana, India",
                  },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <c.icon size={16} className="text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="text-sm font-medium">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl border bg-card space-y-3 mt-6">
                <h4 className="text-sm font-heading font-bold">
                  Already a partner?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Access your dashboard and tools through the agent portal.
                </p>
                <Button variant="outline-primary" size="sm">
                  Agent Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
