import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { trackProductionRequestSubmit } from "@/lib/analytics";

interface ProductionAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lead payload structure for CRM / backend integration
// Status lifecycle: New → Contacted → Docs Sent → Sandbox Shared → Integration In Progress → Production Review → Live → Lost
interface ProductionLeadPayload {
  fullName: string;
  workEmail: string;
  companyName: string;
  apiGoingLive: string;
  sandboxStatus: string;
  useCase: string;
  timeline: string;
  sourcePage: "integrations";
  sourceCTA: "production_access";
  leadType: "production_request";
  createdAt: string;
}

/**
 * Submits production lead to Supabase leads table.
 */
async function submitProductionLead(payload: ProductionLeadPayload): Promise<void> {
  const { createLeadWithDedup } = await import("@/lib/leads-service");
  await createLeadWithDedup({
    full_name: payload.fullName,
    email: payload.workEmail,
    company_name: payload.companyName,
    message: payload.useCase,
    lead_source_page: payload.sourcePage,
    lead_source_type: "production_access_request",
    audience_type: "developer",
    metadata_json: { apiGoingLive: payload.apiGoingLive, sandboxStatus: payload.sandboxStatus, timeline: payload.timeline },
  });
}

const ProductionAccessModal = ({ open, onOpenChange }: ProductionAccessModalProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiGoingLive, setApiGoingLive] = useState("");
  const [sandboxStatus, setSandboxStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: ProductionLeadPayload = {
      fullName: (data.get("fullName") as string).trim(),
      workEmail: (data.get("workEmail") as string).trim(),
      companyName: (data.get("companyName") as string).trim(),
      apiGoingLive,
      sandboxStatus,
      useCase: (data.get("useCase") as string).trim(),
      timeline: (data.get("timeline") as string)?.trim() || "",
      sourcePage: "integrations",
      sourceCTA: "production_access",
      leadType: "production_request",
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      await submitProductionLead(payload);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setApiGoingLive("");
    setSandboxStatus("");
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
              <DialogTitle className="text-lg font-heading">Production request received</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5">
                Our team will review your integration and respond with next steps for production access.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} variant="outline" size="sm" className="mt-2">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-heading">Request production access</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Share your integration details for production review.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="prod-name" className="text-xs">Full Name</Label>
                  <Input id="prod-name" name="fullName" required placeholder="Your name" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="prod-email" className="text-xs">Work Email</Label>
                  <Input id="prod-email" name="workEmail" type="email" required placeholder="you@company.com" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="prod-company" className="text-xs">Company Name</Label>
                  <Input id="prod-company" name="companyName" required placeholder="Company" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">API / Product Going Live</Label>
                  <Select required value={apiGoingLive} onValueChange={setApiGoingLive}>
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
                <Label className="text-xs">Current Sandbox Status</Label>
                <Select required value={sandboxStatus} onValueChange={setSandboxStatus}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not started yet</SelectItem>
                    <SelectItem value="in-progress">Testing in progress</SelectItem>
                    <SelectItem value="completed">Sandbox testing completed</SelectItem>
                    <SelectItem value="skipped">Skipping sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-usecase" className="text-xs">Go-Live Use Case</Label>
                <Textarea id="prod-usecase" name="useCase" required placeholder="Describe your integration and go-live plan" rows={2} className="text-sm min-h-[60px]" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-timeline" className="text-xs">Expected Timeline <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="prod-timeline" name="timeline" placeholder="e.g. Q1 2026" className="h-9 text-sm" />
              </div>
              <Button type="submit" className="w-full h-9 text-sm" disabled={submitting}>
                {submitting ? "Submitting…" : "Request production access"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductionAccessModal;
