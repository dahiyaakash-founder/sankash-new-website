import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Upload,
  Calculator,
  HelpCircle,
  BookOpen,
  Users,
  Code,
  Headphones,
  LogIn,
  FileText,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

type AssistantState = "default" | "routing" | "next-step";
type RouteChoice = "traveler" | "agent" | "integrations" | "support" | null;

const routeOptions = [
  { id: "traveler" as const, icon: Upload, label: "I'm a traveler" },
  { id: "agent" as const, icon: Users, label: "I'm a travel agent" },
  { id: "integrations" as const, icon: Code, label: "I need integration help" },
  { id: "support" as const, icon: Headphones, label: "I need support" },
];

const nextSteps: Record<string, { icon: typeof Upload; label: string; link?: string; href?: string }[]> = {
  traveler: [
    { icon: Upload, label: "Upload a quote for review", link: "/for-travelers" },
    { icon: Calculator, label: "Check EMI options", link: "/for-travelers" },
    { icon: HelpCircle, label: "Ask a question", href: "#demo-form" },
  ],
  agent: [
    { icon: FileText, label: "Review an itinerary", link: "/for-travel-agents" },
    { icon: BookOpen, label: "Understand onboarding", link: "/for-travel-agents" },
    { icon: LogIn, label: "Sign up / Login", href: "#" },
  ],
  integrations: [
    { icon: BookOpen, label: "View documentation", link: "/developers" },
    { icon: Code, label: "Get sandbox access", link: "/developers" },
    { icon: ExternalLink, label: "Request production access", link: "/developers" },
  ],
  support: [
    { icon: LogIn, label: "Existing partner login", href: "#" },
    { icon: Mail, label: "Contact support", href: "mailto:support@sankash.in" },
    { icon: FileText, label: "Continue with form", href: "#demo-form" },
  ],
};

const routeLabels: Record<string, string> = {
  traveler: "For travelers",
  agent: "For travel agents",
  integrations: "For integrations",
  support: "For support",
};

const promptStarters = [
  "I'm a travel agent, where do I start?",
  "I want to understand EMI options",
  "I need sandbox access",
  "I need help with an existing issue",
];

const SanKashAssistant = () => {
  const [state, setState] = useState<AssistantState>("default");
  const [route, setRoute] = useState<RouteChoice>(null);

  const handlePromptClick = (prompt: string) => {
    if (prompt.includes("travel agent")) {
      setRoute("agent");
      setState("next-step");
    } else if (prompt.includes("EMI")) {
      setRoute("traveler");
      setState("next-step");
    } else if (prompt.includes("sandbox")) {
      setRoute("integrations");
      setState("next-step");
    } else {
      setRoute("support");
      setState("next-step");
    }
  };

  const handleRouteSelect = (id: RouteChoice) => {
    setRoute(id);
    setState("next-step");
  };

  const handleBack = () => {
    if (state === "next-step") {
      setState("routing");
      setRoute(null);
    } else {
      setState("default");
      setRoute(null);
    }
  };

  const handleReset = () => {
    setState("default");
    setRoute(null);
  };

  return (
    <section className="py-16 md:py-20 bg-accent/40">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border bg-card overflow-hidden"
        >
          {/* Header — always visible */}
          <div className="px-8 pt-8 md:px-10 md:pt-10 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles size={12} />
              Smart guide
            </div>
            <h2 className="text-2xl font-heading font-bold">
              SanKash Assistant
            </h2>
          </div>

          {/* State content */}
          <div className="px-8 pb-8 md:px-10 md:pb-10 pt-5">
            <AnimatePresence mode="wait">
              {/* DEFAULT STATE */}
              {state === "default" && (
                <motion.div
                  key="default"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <p className="text-muted-foreground text-sm max-w-lg mx-auto text-center leading-relaxed">
                    Find the right next step — whether you're exploring products,
                    starting onboarding, or looking for support.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2.5 max-w-lg mx-auto">
                    {promptStarters.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handlePromptClick(prompt)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-background text-left text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200"
                      >
                        <MessageSquare size={13} className="text-primary shrink-0" />
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <div className="text-center pt-1">
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setState("routing")}
                    >
                      <MessageSquare size={16} />
                      Start a conversation
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ROUTING STATE */}
              {state === "routing" && (
                <motion.div
                  key="routing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <p className="text-sm text-muted-foreground text-center">
                    What best describes you?
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                    {routeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleRouteSelect(opt.id)}
                        className="group flex items-center gap-3 px-5 py-4 rounded-xl border bg-background text-left hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                          <opt.icon size={16} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="text-center pt-1">
                    <button
                      onClick={handleBack}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={12} />
                      Back
                    </button>
                  </div>
                </motion.div>
              )}

              {/* NEXT-STEP STATE */}
              {state === "next-step" && route && (
                <motion.div
                  key="next-step"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-xs font-medium text-accent-foreground">
                      {routeLabels[route]}
                    </span>
                    <p className="text-sm text-muted-foreground mt-3">
                      Here's where to go next.
                    </p>
                  </div>

                  <div className="space-y-2 max-w-sm mx-auto">
                    {nextSteps[route].map((step) => {
                      const content = (
                        <div className="group flex items-center gap-3 px-5 py-3.5 rounded-xl border bg-background hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                            <step.icon size={14} className="text-primary" />
                          </div>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors flex-1">
                            {step.label}
                          </span>
                          <ArrowRight size={13} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      );

                      if (step.link) {
                        return (
                          <Link key={step.label} to={step.link} className="block">
                            {content}
                          </Link>
                        );
                      }
                      return (
                        <a key={step.label} href={step.href} className="block">
                          {content}
                        </a>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      onClick={handleBack}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={12} />
                      Back
                    </button>
                    <span className="text-muted-foreground/30">·</span>
                    <button
                      onClick={handleReset}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Start over
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SanKashAssistant;
