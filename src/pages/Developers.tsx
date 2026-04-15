import { useEffect, useMemo, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import AssistantEntryPoint from "@/components/AssistantEntryPoint";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CreditCard, Banknote, Lock, Terminal, CheckCircle2, ExternalLink } from "lucide-react";
import SandboxAccessModal from "@/components/developers/SandboxAccessModal";
import ProductionAccessModal from "@/components/developers/ProductionAccessModal";
import IntegrationQuestionModal from "@/components/developers/IntegrationQuestionModal";
import ApiFinderModal from "@/components/developers/ApiFinderModal";
import { SANKASH_DEVELOPERS_DOCS_URL } from "@/lib/constants";
import { trackDocsClick, trackGetSandboxAccessClick } from "@/lib/analytics";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.45 },
};

const gettingStartedSteps = [
  { num: "01", label: "Explore the docs", desc: "Browse the full API reference, request and response examples, and integration guides — no account needed.", action: "docs" as const },
  { num: "02", label: "Request sandbox access", desc: "Request test credentials to explore SanKash APIs in a sandbox environment.", action: "sandbox" as const },
  { num: "03", label: "Build and test", desc: "Integrate SanKash APIs into your platform using sandbox mode. Test quotes, payments, and workflows with sample data.", action: "docs" as const },
  { num: "04", label: "Request production access", desc: "Once testing is complete, request production access for review and go-live.", action: "production" as const },
];

const lendingEndpoints = [
  "No Cost EMI enablement",
  "Finance eligibility and pre-qualification",
  "Checkout-linked lending flow",
  "Hosted or integrated options by use case",
];

const insuranceEndpoints = [
  "Quote generation and plan selection",
  "Traveler details submission",
  "Policy issuance and confirmation",
  "Booking-linked protection workflows",
];

const paymentsEndpoints = [
  "Payment collection and checkout flows",
  "Payment link generation",
  "Settlement tracking and status",
  "Reconciliation and reporting",
];

type DeveloperDocsKey = "overview" | "lending" | "insurance" | "payments";

const docsHashes: Record<DeveloperDocsKey, string> = {
  overview: "#developer-docs",
  lending: "#developer-docs-lending",
  insurance: "#developer-docs-insurance",
  payments: "#developer-docs-payments",
};

const developerDocsContent: Record<Exclude<DeveloperDocsKey, "overview">, {
  label: string;
  title: string;
  description: string;
  authNote: string;
  useCases: string[];
  capabilities: string[];
  sampleRequest: string;
  sampleResponse: string;
}> = {
  lending: {
    label: "Lending & Checkout API",
    title: "Offer No Cost EMI inside your booking journey",
    description: "Use this API when you want to check finance eligibility, show EMI plans, and move the traveler into a SanKash-enabled checkout flow.",
    authNote: "Basic auth with your KEY ID and KEY SECRET. Sandbox access is needed before real checkout testing.",
    useCases: [
      "Show EMI or No Cost EMI on package, flight, or holiday checkout",
      "Check whether a quote amount is financeable before checkout",
      "Pass a traveler into a hosted or embedded lending step",
    ],
    capabilities: [
      "Eligibility and affordability checks",
      "Tenure and monthly EMI options",
      "Checkout-linked financing handoff",
      "Hosted or integrated flow depending on your stack",
    ],
    sampleRequest: `POST /v1/lending/eligibility
Authorization: Basic {KEY_ID:KEY_SECRET}
Content-Type: application/json

{
  "trip_amount": 125000,
  "currency": "INR",
  "destination": "Bali",
  "traveler_count": 2
}`,
    sampleResponse: `{
  "eligible": true,
  "max_finance_amount": 125000,
  "emi_options": [
    { "tenure_months": 3, "monthly_emi": 41667, "no_cost_emi": true },
    { "tenure_months": 6, "monthly_emi": 20834, "no_cost_emi": false }
  ]
}`,
  },
  insurance: {
    label: "Travel Insurance API",
    title: "Quote, attach, and issue travel protection in the same flow",
    description: "Use this API when you want to generate protection options, capture traveler details, and issue policies alongside the booking.",
    authNote: "Basic auth with sandbox credentials first. Production issuance should only begin after SanKash approves your integration.",
    useCases: [
      "Show insurance at checkout or after itinerary selection",
      "Generate quote options against trip value and destination",
      "Issue policy after traveler details are confirmed",
    ],
    capabilities: [
      "Quote generation and plan selection",
      "Traveler detail capture",
      "Policy issuance and booking linkage",
      "Status confirmation for ops and customer support",
    ],
    sampleRequest: `POST /v1/insurance/quote
Authorization: Basic {KEY_ID:KEY_SECRET}
Content-Type: application/json

{
  "trip_value": 85000,
  "destination": "Thailand",
  "travel_start_date": "2026-11-12",
  "travel_end_date": "2026-11-18"
}`,
    sampleResponse: `{
  "plans": [
    {
      "plan_id": "travel-secure",
      "premium": 1499,
      "coverage_summary": ["medical", "baggage", "trip_delay"]
    }
  ]
}`,
  },
  payments: {
    label: "Payments API",
    title: "Collect and reconcile travel payments cleanly",
    description: "Use this API when you need to collect trip payments, generate payment links, and keep payment status aligned with your travel workflow.",
    authNote: "Basic auth works here too. Use sandbox mode to test link generation and status callbacks before going live.",
    useCases: [
      "Generate payment links for holidays or balances",
      "Collect staged payments tied to a lead or booking",
      "Track settlement and reconciliation state for ops",
    ],
    capabilities: [
      "Payment link generation",
      "Payment status and callback handling",
      "Settlement visibility",
      "Reconciliation-ready transaction references",
    ],
    sampleRequest: `POST /v1/payments/link
Authorization: Basic {KEY_ID:KEY_SECRET}
Content-Type: application/json

{
  "booking_reference": "BK-1027",
  "amount": 45000,
  "currency": "INR",
  "customer_name": "Riya Mehta"
}`,
    sampleResponse: `{
  "payment_link": "https://pay.sankash.in/link/abc123",
  "status": "created",
  "expires_at": "2026-11-01T18:30:00Z"
}`,
  },
};

function resolveDeveloperDocsKey(hash: string): DeveloperDocsKey | null {
  switch (hash) {
    case "#developer-docs":
      return "overview";
    case "#developer-docs-lending":
      return "lending";
    case "#developer-docs-insurance":
      return "insurance";
    case "#developer-docs-payments":
      return "payments";
    default:
      return null;
  }
}

const Developers = () => {
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [productionOpen, setProductionOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const initialDocsKey = typeof window !== "undefined" ? resolveDeveloperDocsKey(window.location.hash) : null;
  const [activeDocsKey, setActiveDocsKey] = useState<DeveloperDocsKey>(initialDocsKey ?? "overview");
  const [docsPanelOpen, setDocsPanelOpen] = useState(() => initialDocsKey !== null);

  useEffect(() => {
    const syncHashState = () => {
      const nextKey = resolveDeveloperDocsKey(window.location.hash);
      setDocsPanelOpen(nextKey !== null);
      if (nextKey) setActiveDocsKey(nextKey);
    };

    syncHashState();
    window.addEventListener("hashchange", syncHashState);
    return () => window.removeEventListener("hashchange", syncHashState);
  }, []);

  const openDeveloperDocs = (sourceCta: string, docsKey: DeveloperDocsKey = "overview") => {
    trackDocsClick({ source_page: "developers", source_cta: sourceCta });
    setDocsPanelOpen(true);
    setActiveDocsKey(docsKey);
    window.location.assign(docsHashes[docsKey]);
  };
  const activeDocsContent = useMemo(
    () => (activeDocsKey === "overview" ? null : developerDocsContent[activeDocsKey]),
    [activeDocsKey]
  );

  return (
    <SiteLayout>
      <SEOHead
        title="Travel API Integrations for EMI, Insurance and Payments | SanKash"
        description="Integrate SanKash APIs for travel lending, insurance and payments into your booking flow with sandbox and production access."
      />

      {/* Modals */}
      <SandboxAccessModal open={sandboxOpen} onOpenChange={setSandboxOpen} />
      <ProductionAccessModal open={productionOpen} onOpenChange={setProductionOpen} />
      <IntegrationQuestionModal open={questionOpen} onOpenChange={setQuestionOpen} />
      <ApiFinderModal open={finderOpen} onOpenChange={setFinderOpen} onOpenSandbox={() => setSandboxOpen(true)} />

      {/* Hero */}
      <section className="bg-hero-gradient py-10 md:py-28">
        <div className="container max-w-3xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">API & Integrations</p>
            <h1 className="text-[1.75rem] sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-primary-deep leading-tight">
              Integrate SanKash in days, not months
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Simple APIs and checkout flows for lending, insurance, and payments — built for real travel workflows.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
              <Button size="xl" asChild>
                <a
                  href={SANKASH_DEVELOPERS_DOCS_URL}
                  onClick={() => trackDocsClick({ source_page: "developers", source_cta: "hero_view_docs" })}
                >
                  View Docs <ExternalLink size={16} />
                </a>
              </Button>
              <Button size="xl" variant="outline" onClick={() => { trackGetSandboxAccessClick(); setSandboxOpen(true); }}>
                Get Sandbox Access
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Prefer to speak first?{" "}
              <Link to="/contact" className="text-primary hover:underline underline-offset-2">Contact us</Link>
              {" "}for integration support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-10 md:py-28">
        <div className="container">
          <motion.div {...fade} className="max-w-2xl mb-8 md:mb-14">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em] mb-3">Getting started</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              Four steps to go live
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gettingStartedSteps.map((step, i) => {
              const handleClick = () => {
                if (step.action === "docs") {
                  openDeveloperDocs(`getting_started_${step.num}`);
                }
                else if (step.action === "sandbox") { trackGetSandboxAccessClick(); setSandboxOpen(true); }
                else if (step.action === "production") setProductionOpen(true);
              };
              return (
                <motion.div key={step.num} {...fade} transition={{ delay: i * 0.08, duration: 0.4 }} className="relative">
                  <button onClick={handleClick} className="bg-card border rounded-xl p-6 shadow-card h-full text-left w-full hover:border-primary/30 transition-colors group">
                    <span className="text-3xl font-heading font-bold text-primary/15">{step.num}</span>
                    <h3 className="text-base font-heading font-bold text-primary-deep mt-2 group-hover:text-primary transition-colors">{step.label}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                  </button>
                  {i < gettingStartedSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                      <ArrowRight size={14} className="text-primary/30" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section id="developer-api-overview" className="py-10 md:py-28 bg-section-alt scroll-mt-24">
        <div className="container">
          <motion.div {...fade} className="max-w-2xl mb-8 md:mb-14">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em] mb-3">API overview</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary-deep">
              Three integrations, built for travel
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Lending, Insurance, and Payments — everything you need to embed travel financial infrastructure into your platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Lending API */}
            <motion.div {...fade} transition={{ delay: 0, duration: 0.45 }} className="rounded-2xl border bg-card p-5 sm:p-8 md:p-10 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Banknote size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-primary-deep">Lending & Checkout API</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Offer No Cost EMI at checkout and let customers book holidays in monthly instalments. Integrate via API or use SanKash's hosted checkout.
              </p>
              <ul className="space-y-2.5">
                {lendingEndpoints.map((ep) => (
                  <li key={ep} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                    {ep}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button size="sm" asChild>
                  <button type="button" onClick={() => openDeveloperDocs("lending_api_docs", "lending")}>View Docs</button>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSandboxOpen(true)}>Get Sandbox Access</Button>
              </div>
            </motion.div>

            {/* Insurance API */}
            <motion.div {...fade} transition={{ delay: 0.08, duration: 0.45 }} className="rounded-2xl border bg-card p-5 sm:p-8 md:p-10 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-primary-deep">Travel Insurance API</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Programmatically offer travel protection at the point of booking. Generate quotes, collect traveler details, and issue policies — all linked to the booking workflow.
              </p>
              <ul className="space-y-2.5">
                {insuranceEndpoints.map((ep) => (
                  <li key={ep} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                    {ep}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button size="sm" asChild>
                  <button type="button" onClick={() => openDeveloperDocs("insurance_api_docs", "insurance")}>View Docs</button>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSandboxOpen(true)}>Get Sandbox Access</Button>
              </div>
            </motion.div>

            {/* Payments API */}
            <motion.div {...fade} transition={{ delay: 0.16, duration: 0.45 }} className="rounded-2xl border bg-card p-5 sm:p-8 md:p-10 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <CreditCard size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-primary-deep">Payments API</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Collect payments, generate payment links, and manage settlements. Built for travel's multi-party settlement complexity.
              </p>
              <ul className="space-y-2.5">
                {paymentsEndpoints.map((ep) => (
                  <li key={ep} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                    {ep}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button size="sm" asChild>
                  <button type="button" onClick={() => openDeveloperDocs("payments_api_docs", "payments")}>View Docs</button>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSandboxOpen(true)}>Get Sandbox Access</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section id="developer-auth" className="py-10 md:py-28 scroll-mt-24">
        <div className="container max-w-3xl">
          <motion.div {...fade} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Lock size={20} className="text-primary" />
              </div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">Authentication</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary-deep">
              Basic Authentication
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All SanKash integrations use Basic Authentication with a <strong className="text-foreground">KEY ID</strong> and <strong className="text-foreground">KEY SECRET</strong>. This applies to direct API calls and checkout-linked flows. Sandbox credentials are available immediately when you sign up. Production credentials are shared privately after your integration is reviewed and approved.
            </p>
            <div className="bg-muted rounded-xl p-6 border">
              <pre className="text-sm font-mono text-foreground leading-relaxed overflow-x-auto">
{`Authorization: Basic {base64(KEY_ID:KEY_SECRET)}

# Example request
curl -X POST https://api.sankash.in/v1/insurance/quote \\
  -H "Authorization: Basic {credentials}" \\
  -H "Content-Type: application/json" \\
  -d '{"trip_value": 85000, "destination": "Thailand"}'`}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              Credentials are never shared publicly.{" "}
              <button onClick={() => setSandboxOpen(true)} className="text-primary hover:underline underline-offset-2">
                Request sandbox access
              </button>{" "}
              to get started.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Docs & Sandbox */}
      <section id="developer-docs" className="py-10 md:py-28 bg-section-alt scroll-mt-24">
        <div className="container max-w-3xl">
          <div id="developer-docs-lending" className="scroll-mt-24" />
          <div id="developer-docs-insurance" className="scroll-mt-24" />
          <div id="developer-docs-payments" className="scroll-mt-24" />
          <motion.div {...fade} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Terminal size={20} className="text-primary" />
              </div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">Docs & sandbox</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary-deep">
              Everything you need to build
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Full API documentation, sandbox environment for testing, and integration support from our team.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <button
                type="button"
                onClick={() => openDeveloperDocs("docs_section_card")}
                className="bg-card border rounded-xl p-5 shadow-card hover:border-primary/30 transition-colors group"
              >
                <h3 className="text-sm font-heading font-bold text-primary-deep group-hover:text-primary transition-colors">Documentation</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Full API reference, request and response examples, and integration guides</p>
              </button>
              <button type="button" onClick={() => setSandboxOpen(true)} className="bg-card border rounded-xl p-5 shadow-card hover:border-primary/30 transition-colors text-left group">
                <h3 className="text-sm font-heading font-bold text-primary-deep group-hover:text-primary transition-colors">Sandbox credentials</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Test your integration safely with sample data before going live</p>
              </button>
              <Link to="/contact" className="bg-card border rounded-xl p-5 shadow-card hover:border-primary/30 transition-colors group">
                <h3 className="text-sm font-heading font-bold text-primary-deep group-hover:text-primary transition-colors">Integration support</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Our team supports you from first API call to production launch</p>
              </Link>
            </div>

            {docsPanelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4 shadow-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-heading font-bold text-primary-deep">
                      {activeDocsKey === "overview" ? "Docs quickstart" : activeDocsContent?.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeDocsKey === "overview"
                        ? "Choose an API area and land directly in a useful internal docs state."
                        : activeDocsContent?.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setFinderOpen(true)}>
                      Find the right API
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSandboxOpen(true)}>
                      Get Sandbox Access
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["overview", "lending", "insurance", "payments"] as DeveloperDocsKey[]).map((key) => {
                    const label = key === "overview"
                      ? "Overview"
                      : developerDocsContent[key].label.replace(" API", "");
                    const active = activeDocsKey === key;
                    return (
                      <Button
                        key={key}
                        size="sm"
                        variant={active ? "default" : "outline"}
                        onClick={() => openDeveloperDocs(`docs_tab_${key}`, key)}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>

                {activeDocsKey === "overview" ? (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {(["lending", "insurance", "payments"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => openDeveloperDocs(`docs_overview_${key}`, key)}
                        className="rounded-xl border bg-accent/20 p-4 text-left hover:border-primary/30 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-primary-deep group-hover:text-primary transition-colors">
                              {developerDocsContent[key].label}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {developerDocsContent[key].useCases[0]}
                            </p>
                          </div>
                          <ArrowRight size={15} className="text-primary/50 shrink-0 mt-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : activeDocsContent && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-accent/20 p-4 space-y-2">
                      <p className="text-sm font-semibold text-primary-deep">{activeDocsContent.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{activeDocsContent.authNote}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-xl border p-4 space-y-3">
                        <p className="text-sm font-semibold text-primary-deep">Core use cases</p>
                        <ul className="space-y-2">
                          {activeDocsContent.useCases.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border p-4 space-y-3">
                        <p className="text-sm font-semibold text-primary-deep">Key capabilities</p>
                        <ul className="space-y-2">
                          {activeDocsContent.capabilities.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-xl border p-4 space-y-3">
                        <p className="text-sm font-semibold text-primary-deep">Sample request</p>
                        <pre className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words font-mono bg-muted rounded-lg p-3">
                          {activeDocsContent.sampleRequest}
                        </pre>
                      </div>
                      <div className="rounded-xl border p-4 space-y-3">
                        <p className="text-sm font-semibold text-primary-deep">Sample response</p>
                        <pre className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words font-mono bg-muted rounded-lg p-3">
                          {activeDocsContent.sampleResponse}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <AssistantEntryPoint prompts={[
        { label: "Ask an integration question", onClick: () => setQuestionOpen(true) },
        { label: "Get sandbox help", onClick: () => setSandboxOpen(true) },
        { label: "Find the right API", onClick: () => setFinderOpen(true) },
      ]} />

      {/* Final CTA */}
      <section className="py-10 md:py-28 bg-brand-deep text-primary-foreground">
        <motion.div {...fade} className="container max-w-2xl text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Ready to integrate SanKash into your travel flow?
          </h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            Get sandbox access or talk to our team about production integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" variant="secondary" onClick={() => setSandboxOpen(true)}>
              Get Sandbox Access
            </Button>
            <Button size="lg" variant="ghost-dark" onClick={() => setProductionOpen(true)}>
              Request Production Access
            </Button>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
};

export default Developers;
