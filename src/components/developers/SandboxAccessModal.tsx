import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { SANKASH_DOCS_URL } from "@/lib/constants";
import { trackSandboxRequestSubmit } from "@/lib/analytics";

interface SandboxAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lead payload structure for CRM / backend integration
// Status lifecycle: New → Contacted → Sandbox Shared → Integration In Progress → Live → Lost
interface SandboxLeadPayload {
  fullName: string;
  workEmail: string;
  companyName: string;
  apiNeeded: string;
  useCase: string;
  sourcePage: "integrations";
  sourceCTA: "sandbox_access";
  leadType: "sandbox_request";
  createdAt: string;
}

/**
 * Submits sandbox lead to Supabase leads table.
 */
async function submitSandboxLead(payload: SandboxLeadPayload): Promise<void> {
  const { createLeadWithDedup } = await import("@/lib/leads-service");
  await createLeadWithDedup({
    full_name: payload.fullName,
    email: payload.workEmail,
    company_name: payload.companyName,
    message: payload.useCase,
    lead_source_page: payload.sourcePage,
    lead_source_type: "sandbox_access_request",
    audience_type: "developer",
    metadata_json: { apiNeeded: payload.apiNeeded },
  });
}

const SandboxAccessModal = ({ open, onOpenChange }: SandboxAccessModalProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiNeeded, setApiNeeded] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: SandboxLeadPayload = {
      fullName: (data.get("fullName") as string).trim(),
      workEmail: (data.get("workEmail") as string).trim(),
      companyName: (data.get("companyName") as string).trim(),
      apiNeeded,
      useCase: (data.get("useCase") as string).trim(),
      sourcePage: "integrations",
      sourceCTA: "sandbox_access",
      leadType: "sandbox_request",
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      await submitSandboxLead(payload);
      trackSandboxRequestSubmit();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    setApiNeeded("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} className="text-primary" />
            </div>
            <DialogHeader className="sm:text-center">
              <DialogTitle className="text-lg font-heading">Request received</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5">
                Our team will review your request and share sandbox credentials shortly.
              </DialogDescription>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              You can also{" "}
              <a href={SANKASH_DOCS_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                explore the public docs
              </a>{" "}
              while we review your request.
            </p>
            <Button onClick={handleClose} variant="outline" size="sm" className="mt-2">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-heading">Request sandbox access</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Get test credentials for SanKash APIs.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sb-name" className="text-xs">Full Name</Label>
                  <Input id="sb-name" name="fullName" required placeholder="Your name" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sb-email" className="text-xs">Work Email</Label>
                  <Input id="sb-email" name="workEmail" type="email" required placeholder="you@company.com" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sb-company" className="text-xs">Company Name</Label>
                  <Input id="sb-company" name="companyName" required placeholder="Company" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">API Needed</Label>
                  <Select required value={apiNeeded} onValueChange={setApiNeeded}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select API" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lending">Lending API</SelectItem>
                      <SelectItem value="insurance">Insurance API</SelectItem>
                      <SelectItem value="payments">Payments API</SelectItem>
                      <SelectItem value="multiple">Multiple APIs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sb-usecase" className="text-xs">Use Case</Label>
                <Textarea id="sb-usecase" name="useCase" required placeholder="What you plan to build or test" rows={2} className="text-sm min-h-[60px]" />
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full h-9 text-sm" disabled={submitting}>
                {submitting ? "Submitting…" : "Request access"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SandboxAccessModal;
