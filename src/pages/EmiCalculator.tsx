import { useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calculator,
  ArrowRight,
  Upload,
  Users,
  Info,
  CreditCard,
  Banknote,
} from "lucide-react";
import {
  calculateEmi,
  calculateAllTenures,
  formatINR,
  TENURES,
  defaultEmiType,
  type EmiType,
  type EmiResult,
} from "@/lib/emi-calculator";
import { AGENT_LOGIN_URL } from "@/lib/constants";

const EmiCalculator = () => {
  const [amount, setAmount] = useState(85000);
  const [selectedTenure, setSelectedTenure] = useState(6);
  const [emiType, setEmiType] = useState<EmiType>("no_cost");

  const currentResult = calculateEmi(amount, selectedTenure, emiType);
  const allTenures = calculateAllTenures(amount);

  const handleTenureChange = (t: number) => {
    setSelectedTenure(t);
    setEmiType(defaultEmiType(t));
  };

  return (
    <SiteLayout>
      <SEOHead
        title="Travel EMI Calculator — No Cost EMI for Holidays | SanKash"
        description="Calculate monthly EMI for your holiday or travel booking. Compare No Cost EMI and standard EMI across 3 to 24-month tenures. Indicative estimates from SanKash."
      />

      {/* Hero */}
      <section className="bg-hero-gradient py-14 md:py-20">
        <div className="container max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-3.5 py-1">
            <Calculator size={12} className="text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
              EMI Calculator
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-foreground">
            Travel EMI Calculator
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estimate your monthly EMI for a holiday or travel booking across 3, 6, 9, 12, 18, and 24‑month tenures.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-10 md:py-16">
        <div className="container max-w-4xl">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Input panel */}
            <div className="lg:col-span-2 space-y-5 p-6 rounded-2xl border bg-card">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trip Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    min={10000}
                    max={5000000}
                    className="w-full pl-7 pr-4 py-3 rounded-xl border bg-background text-lg font-heading font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Min ₹10,000 · Max ₹50,00,000</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tenure</label>
                <div className="grid grid-cols-3 gap-2">
                  {TENURES.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTenureChange(t)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        selectedTenure === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-foreground hover:bg-accent/80"
                      }`}
                    >
                      {t} mo
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">EMI Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEmiType("no_cost")}
                    className={`py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      emiType === "no_cost"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-foreground hover:bg-accent/80"
                    }`}
                  >
                    No Cost EMI
                  </button>
                  <button
                    onClick={() => setEmiType("standard")}
                    className={`py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      emiType === "standard"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-foreground hover:bg-accent/80"
                    }`}
                  >
                    Standard EMI
                  </button>
                </div>
              </div>
            </div>

            {/* Result panel */}
            <div className="lg:col-span-3 space-y-5">
              {/* Primary result */}
              <motion.div
                key={`${amount}-${selectedTenure}-${emiType}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-2xl border bg-card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your EMI Estimate
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto ${
                    emiType === "no_cost" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {emiType === "no_cost" ? "No Cost EMI" : "Standard EMI"}
                  </span>
                </div>

                <div className="text-center py-4">
                  <p className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                    {formatINR(currentResult.monthlyEmi)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">per month × {selectedTenure} months</p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Processing Fee</p>
                    <p className="text-sm font-heading font-bold">{formatINR(currentResult.processingFee)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total Interest</p>
                    <p className="text-sm font-heading font-bold">
                      {currentResult.totalInterest === 0 ? "₹0" : formatINR(currentResult.totalInterest)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total Payable</p>
                    <p className="text-sm font-heading font-bold">{formatINR(currentResult.totalPayable)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Comparison table */}
              <div className="rounded-2xl border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b bg-muted/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    All tenure options for {formatINR(amount)}
                  </p>
                </div>
                <div className="divide-y">
                  {allTenures.map((r) => (
                    <div
                      key={r.tenure}
                      className={`flex items-center justify-between px-5 py-3 text-sm cursor-pointer hover:bg-accent/30 transition-colors ${
                        r.tenure === selectedTenure ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleTenureChange(r.tenure)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold w-12">{r.tenure} mo</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          r.emiType === "no_cost" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {r.emiType === "no_cost" ? "No Cost" : "Standard"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-heading font-bold">{formatINR(r.monthlyEmi)}</span>
                        <span className="text-muted-foreground text-xs">/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-4 rounded-xl bg-accent/50 border border-border/50">
                <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Indicative calculation only. Final lender offer may differ based on eligibility, trip details, and underwriting. Processing fee of 2.5% may apply. EMI options subject to lender approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-10 md:py-14 bg-section-alt">
        <div className="container max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border bg-card space-y-3">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <Upload size={18} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground">For Travelers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload your holiday quote and explore exact EMI options, savings, and travel protection.
              </p>
              <Link to="/for-travelers">
                <Button size="sm" className="gap-1.5">
                  Upload My Quote <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="p-6 rounded-2xl border bg-card space-y-3">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground">For Travel Agents</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Offer No Cost EMI at checkout. Sign up to start presenting financing options to your customers.
              </p>
              <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1.5">
                  Agent Signup <ArrowRight size={14} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-14 md:py-20">
        <div className="container max-w-3xl prose prose-sm">
          <h2 className="text-2xl font-heading font-bold text-foreground">What is a travel EMI calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">
            A travel EMI calculator helps you estimate the monthly instalment for a holiday or travel booking. Enter your trip cost, choose a tenure between 3 and 24 months, and see what your booking would cost per month — with or without interest.
          </p>

          <h2 className="text-2xl font-heading font-bold text-foreground mt-8">How does No Cost EMI work for holidays?</h2>
          <p className="text-muted-foreground leading-relaxed">
            No Cost EMI means you pay exactly the trip cost divided across monthly instalments, with zero interest. A one-time processing fee of 2.5% applies. On SanKash, No Cost EMI is generally available for 3 and 6-month tenures, making it ideal for holidays in the ₹30,000 to ₹2,00,000 range.
          </p>

          <h2 className="text-2xl font-heading font-bold text-foreground mt-8">Difference between No Cost EMI and Standard EMI</h2>
          <p className="text-muted-foreground leading-relaxed">
            No Cost EMI carries zero interest — you only pay a one-time processing fee. Standard EMI applies a flat interest rate of 1.25% per month on the loan amount, making it more suitable for longer tenures of 9 to 24 months. Both options include a 2.5% processing fee.
          </p>

          <h2 className="text-2xl font-heading font-bold text-foreground mt-8">Why travel agents use EMI during checkout</h2>
          <p className="text-muted-foreground leading-relaxed">
            Travel agents offering No Cost EMI at checkout see 20% higher sales and 40% better booking conversion. EMI removes the upfront cost barrier, helping customers choose premium packages and complete bookings faster. Agents get paid in full by the lender, so there's no collection risk.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default EmiCalculator;
