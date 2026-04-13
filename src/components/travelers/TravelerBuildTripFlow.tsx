/**
 * TravelerBuildTripFlow — rich result rendering for Build My Trip.
 *
 * This component receives a BuildMyTripResult and renders the full
 * advisory hierarchy: direction → destinations → structure → budget →
 * versions → finance → questions → deeper details.
 *
 * It does NOT own input collection or backend calls — those stay in BuildMyTrip.tsx.
 */
import { motion } from "framer-motion";
import {
  MapPin, ArrowRight, CheckCircle2, CreditCard, Star,
  HelpCircle, Compass, TrendingUp, Wallet, BarChart3,
} from "lucide-react";
import type {
  BuildMyTripResult,
  DestinationOption,
  TripStructure,
  ClarifyingQuestion,
  BudgetFit,
  FinanceDirection,
  TripVersion,
} from "@/lib/build-my-trip";

/* ─── Sub-components ─── */

function DirectionHeader({ result }: { result: BuildMyTripResult }) {
  return (
    <div className="bg-accent/30 rounded-xl p-3.5 space-y-1.5">
      <h3 className="font-heading font-bold text-foreground text-base leading-snug">
        {result.direction}
      </h3>
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        {result.whyItFits}
      </p>
      <div className="flex items-start gap-2 pt-0.5">
        <ArrowRight size={11} className="text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground font-medium">{result.nextStep}</p>
      </div>
    </div>
  );
}

function DestinationShortlistSection({ items }: { items: DestinationOption[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MapPin size={13} className="text-primary" />
        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
          Destination Shortlist
        </span>
      </div>
      <div className="space-y-1.5">
        {items.map((d) => (
          <div key={d.name} className="rounded-lg border border-border/80 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-[13px] text-foreground">{d.name}</span>
              {d.estimatedBudget && (
                <span className="text-[10px] text-muted-foreground">{d.estimatedBudget}</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{d.whyItFits}</p>
            {d.bestFor && (
              <p className="text-[10px] text-primary font-medium">Best for: {d.bestFor}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TripStructureSection({ structure }: { structure: TripStructure }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Compass size={13} className="text-brand-green" />
        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
          Trip Structure
        </span>
      </div>
      <div className="rounded-lg border border-border/80 p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-[13px] text-foreground">{structure.headline}</span>
          <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full text-muted-foreground">{structure.nights}</span>
        </div>
        {structure.packageMode && (
          <p className="text-[10px] text-muted-foreground">Package type: {structure.packageMode}</p>
        )}
        {structure.segments.length > 0 && (
          <div className="space-y-0.5 pt-1">
            {structure.segments.map((seg, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 size={10} className="text-brand-green shrink-0 mt-0.5" />
                <span className="text-[11px] text-foreground">{seg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetFitSection({ budget }: { budget: BudgetFit }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Wallet size={13} className="text-primary" />
        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
          Budget Estimate
        </span>
      </div>
      <div className="rounded-lg border border-primary/15 bg-primary/[0.02] p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg text-foreground">{budget.totalEstimate}</span>
          <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full text-muted-foreground capitalize">
            {budget.position}
          </span>
        </div>
        {budget.perPerson && (
          <p className="text-[11px] text-muted-foreground">{budget.perPerson}</p>
        )}
        {budget.insight && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">{budget.insight}</p>
        )}
      </div>
    </div>
  );
}

function VersionCard({ version, isPrimary }: { version: TripVersion; isPrimary: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 space-y-2.5 transition-shadow ${
        isPrimary
          ? "border-primary/25 bg-primary/[0.02] shadow-card"
          : "border-border hover:shadow-card"
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            version.tagColor ?? (isPrimary ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground")
          }`}
        >
          {version.label}
        </span>
        {version.tag && (
          <span className="text-[10px] font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
            {version.tag}
          </span>
        )}
      </div>
      <h4 className="font-heading font-bold text-foreground text-[15px] leading-snug">
        {version.headline}
      </h4>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{version.summary}</p>
      <div className="space-y-1">
        {version.highlights.map((h) => (
          <div key={h} className="flex items-start gap-2">
            <CheckCircle2 size={11} className="text-brand-green shrink-0 mt-0.5" />
            <span className="text-[11px] text-foreground leading-relaxed">{h}</span>
          </div>
        ))}
      </div>
      {(version.emiMonthly || version.emiStepUp) && (
        <div className="flex items-center gap-2 pt-2 mt-1 border-t border-border/60">
          <CreditCard size={13} className="text-primary shrink-0" />
          {version.emiMonthly && (
            <>
              <span className="text-sm font-heading font-bold text-foreground">{version.emiMonthly}</span>
              {version.emiTenure && (
                <span className="text-[11px] text-muted-foreground">/month · {version.emiTenure}</span>
              )}
            </>
          )}
          {version.emiStepUp && (
            <span className="text-[10px] text-brand-coral font-medium ml-auto">{version.emiStepUp}</span>
          )}
        </div>
      )}
    </div>
  );
}

function FinanceSection({ finance }: { finance: FinanceDirection }) {
  return (
    <div className="flex items-start gap-2 bg-primary/[0.04] rounded-lg border border-primary/15 p-3">
      <TrendingUp size={13} className="text-primary shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="text-[12px] font-heading font-bold text-foreground">{finance.headline}</p>
        <p className="text-[11px] text-muted-foreground">{finance.emiSignal}</p>
        {finance.monthlyEstimate && (
          <p className="text-[11px] text-foreground font-medium">
            From {finance.monthlyEstimate}/month
            {finance.suggestedTenure && ` · ${finance.suggestedTenure}`}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Subject to customer eligibility and lender approval. T&C apply.
        </p>
      </div>
    </div>
  );
}

function ClarifyingQuestionsSection({ questions }: { questions: ClarifyingQuestion[] }) {
  if (questions.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <HelpCircle size={13} className="text-brand-coral" />
        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
          Worth Thinking About
        </span>
      </div>
      <div className="space-y-1.5">
        {questions.slice(0, 4).map((q, i) => (
          <div key={i} className="rounded-lg border border-border/80 p-2.5 space-y-0.5">
            <p className="text-[12px] font-medium text-foreground">{q.question}</p>
            {q.whyItMatters && (
              <p className="text-[10px] text-muted-foreground">{q.whyItMatters}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DeeperDetailsSection({ details }: { details: string[] }) {
  if (details.length === 0) return null;
  return (
    <div className="border rounded-lg p-3 space-y-1">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Good to Know
      </p>
      {details.map((detail, i) => (
        <div key={i} className="flex items-start gap-2">
          <BarChart3 size={10} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">{detail}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─── */

interface TravelerBuildTripFlowProps {
  result: BuildMyTripResult;
  onReset: () => void;
  onContactCapture: () => void;
}

export default function TravelerBuildTripFlow({
  result,
  onReset,
  onContactCapture,
}: TravelerBuildTripFlowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-5 space-y-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-primary" />
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
            Your Trip Direction
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Start over
        </button>
      </div>

      {/* Direction headline */}
      <DirectionHeader result={result} />

      {/* Destination shortlist */}
      <DestinationShortlistSection items={result.destinationShortlist} />

      {/* Trip structure */}
      {result.tripStructure && <TripStructureSection structure={result.tripStructure} />}

      {/* Budget fit */}
      {result.budgetFit && <BudgetFitSection budget={result.budgetFit} />}

      {/* Version cards */}
      {result.versions.length > 0 && (
        <div className="space-y-2.5">
          {result.versions.map((version, i) => (
            <VersionCard key={version.label} version={version} isPrimary={i === 0} />
          ))}
        </div>
      )}

      {/* Finance direction */}
      {result.financeDirection && <FinanceSection finance={result.financeDirection} />}

      {/* EMI signal fallback (if no finance direction but emiSignal exists) */}
      {!result.financeDirection && result.emiSignal && (
        <div className="flex items-start gap-2 bg-primary/[0.04] rounded-lg border border-primary/15 p-3">
          <CreditCard size={13} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">{result.emiSignal}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              No Cost EMI is subject to customer eligibility and lender approval. T&C apply.
            </p>
          </div>
        </div>
      )}

      {/* Clarifying questions */}
      <ClarifyingQuestionsSection questions={result.clarifyingQuestions} />

      {/* Deeper details */}
      <DeeperDetailsSection details={result.deeperDetails} />

      {/* CTA */}
      <div className="pt-1">
        <button
          onClick={onContactCapture}
          className="w-full rounded-xl bg-primary text-primary-foreground font-heading font-bold text-[13px] py-3 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          Get a detailed plan with pricing <ArrowRight size={13} />
        </button>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Free — no obligation. We'll reach out on WhatsApp or call.
        </p>
      </div>
    </motion.div>
  );
}
