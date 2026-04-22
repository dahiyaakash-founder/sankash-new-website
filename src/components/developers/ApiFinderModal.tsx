import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Banknote, ShieldCheck, CreditCard, CheckCircle2, ExternalLink } from "lucide-react";
import {
  SANKASH_DOCS_URL,
  SANKASH_INSURANCE_DOCS_URL,
  SANKASH_LENDING_DOCS_URL,
  SANKASH_PAYMENTS_DOCS_URL,
} from "@/lib/constants";

const useCases = [
  { id: "emi", label: "Offer No Cost EMI", apis: ["Lending & Checkout API"], icon: Banknote },
  { id: "insurance", label: "Embed travel insurance", apis: ["Travel Insurance API"], icon: ShieldCheck },
  { id: "payments", label: "Collect payments", apis: ["Payments API"], icon: CreditCard },
  { id: "multiple", label: "Multiple use cases", apis: ["Lending & Checkout API", "Travel Insurance API", "Payments API"], icon: CheckCircle2 },
] as const;

const docsUrlByUseCase: Record<(typeof useCases)[number]["id"], string> = {
  emi: SANKASH_LENDING_DOCS_URL,
  insurance: SANKASH_INSURANCE_DOCS_URL,
  payments: SANKASH_PAYMENTS_DOCS_URL,
  multiple: SANKASH_DOCS_URL,
};

interface ApiFinderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSandbox: () => void;
}

const ApiFinderModal = ({ open, onOpenChange, onOpenSandbox }: ApiFinderModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClose = () => {
    setSelected(null);
    onOpenChange(false);
  };

  const selectedCase = useCases.find((u) => u.id === selected);
  const docsHref = selected ? docsUrlByUseCase[selected as keyof typeof docsUrlByUseCase] : SANKASH_DOCS_URL;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            {selected ? "Recommended APIs" : "What are you trying to do?"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {selected
              ? "Based on your use case, here's what we recommend."
              : "Select your primary use case and we'll point you to the right APIs."}
          </DialogDescription>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-2 mt-2">
            {useCases.map((uc) => (
              <button
                key={uc.id}
                onClick={() => setSelected(uc.id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-background hover:border-primary/30 hover:bg-accent/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <uc.icon size={18} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{uc.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              {selectedCase?.apis.map((api) => (
                <div key={api} className="flex items-center gap-2.5 p-3 rounded-lg border bg-accent/30">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{api}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="default" className="flex-1" asChild>
                <a href={docsHref} target="_blank" rel="noopener noreferrer">
                  View Docs <ExternalLink size={14} />
                </a>
              </Button>
              <Button
                size="default"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleClose();
                  setTimeout(() => onOpenSandbox(), 150);
                }}
              >
                Get Sandbox Access
              </Button>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Choose a different use case
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApiFinderModal;
