import { useState, useRef } from "react";
import SiteLayout from "@/components/SiteLayout";
import { createLeadWithDedup } from "@/lib/leads-service";
import SEOHead, { contactPageSchema } from "@/components/SEOHead";
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
    description: "Upload a quote and get quick guidance before you book",
    link: "/for-travelers",
  },
  {
    icon: Users,
    label: "Start agent onboarding",
    description: "Understand how SanKash fits your travel agency",
    link: "/for-travel-agents",
  },
  {
    icon: Code,
    label: "Get integration help",
    description: "Docs, sandbox access, and setup guidance",
    link: "/developers",
  },
  {
    icon: Calendar,
    label: "Book a demo",
    description: "See how SanKash works for your business",
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
    scrollTo: "demo-form",
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
    href: "https://app.sankash.in/agent/auth/login",
  },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const form = formRef.current!;
    const data = new FormData(form);

    const fullName = (data.get("fullName") as string)?.trim();
    const email = (data.get("email") as string)?.trim();

    if (!fullName) { setFormError("Full name is required."); setSubmitting(false); return; }
    if (!email) { setFormError("Work email is required."); setSubmitting(false); return; }

    const audienceMap: Record<string, "traveler" | "agent" | "developer" | "partner" | "other"> = {
      "Travel Agent / OTA": "agent",
      "Distribution Partner": "partner",
      "Developer / Integration Partner": "developer",
      "Traveler": "traveler",
      "Other": "other",
    };
    try {
      await createLead({
        full_name: fullName,
        email: email || null,
        mobile_number: (data.get("phone") as string)?.trim() || null,
        company_name: (data.get("company") as string)?.trim() || null,
        message: (data.get("message") as string)?.trim() || null,
        audience_type: audienceMap[(data.get("audience") as string)] ?? "other",
        lead_source_page: "contact",
        lead_source_type: "contact_form",
      });
      setSubmitted(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <SEOHead
        title="Contact SanKash"
        description="Get in touch with SanKash for demos, onboarding, support, integrations and travel business solutions."
        jsonLd={contactPageSchema}
      />
      {/* Hero */}
      <section className="bg-hero-gradient py-10 md:py-28">
        <div className="container max-w-3xl text-center space-y-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">
            Contact
          </p>
          <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl font-heading font-bold tracking-tight">
            How can SanKash help right now?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get instant guidance, book a demo, ask a question, or reach the
            right team — without waiting.
          </p>
        </div>
      </section>

      {/* Quick action cards */}
      <section className="py-10 md:py-20">
        <div className="container max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

      <SanKashAssistant />

      <div className="container max-w-3xl text-center py-4">
        <a
          href="#demo-form"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Prefer to leave a message? <ArrowRight size={11} />
        </a>
      </div>

      {/* Escalation paths */}
      <section id="escalation" className="py-10 md:py-20">
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
              ) : (path as any).scrollTo ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => {
                      const el = document.getElementById((path as any).scrollTo);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {path.cta} <ArrowRight size={12} />
                  </Button>
              ) : path.href?.startsWith("#") ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => {
                      const el = document.getElementById(path.href!.slice(1));
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {path.cta} <ArrowRight size={12} />
                  </Button>
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
      <section id="demo-form" className="py-10 md:py-20 bg-accent/40">
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
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="p-5 sm:p-8 rounded-2xl border bg-card space-y-5"
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
                      <label className="block text-xs font-medium mb-1.5">Full Name</label>
                      <input name="fullName" type="text" required className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">Work Email</label>
                      <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5">Phone</label>
                      <input name="phone" type="tel" className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">Company</label>
                      <input name="company" type="text" className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">I am a...</label>
                    <select name="audience" className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Travel Agent / OTA</option>
                      <option>Distribution Partner</option>
                      <option>Developer / Integration Partner</option>
                      <option>Traveler</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Message</label>
                    <textarea name="message" rows={3} className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                  {formError && (
                    <p className="text-sm text-destructive font-medium">{formError}</p>
                  )}
                  <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit"} {!submitting && <ArrowRight size={16} />}
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
                  { icon: Mail, label: "Support", value: "support@sankash.in" },
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
                <a href="https://app.sankash.in/agent/auth/login" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline-primary" size="sm">
                    Agent Login
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
