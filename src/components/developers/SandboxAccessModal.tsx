import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface SandboxAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SandboxAccessModal = ({ open, onOpenChange }: SandboxAccessModalProps) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <DialogHeader className="sm:text-center">
              <DialogTitle className="text-xl font-heading">Sandbox request received</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Our team will review your request and share sandbox access details on your work email.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} variant="outline" className="mt-4">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-heading">Request sandbox access</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Get test credentials to explore SanKash APIs and checkout flows in a sandbox environment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sb-name">Full Name</Label>
                  <Input id="sb-name" required placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sb-company">Company Name</Label>
                  <Input id="sb-company" required placeholder="Company" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sb-email">Work Email</Label>
                  <Input id="sb-email" type="email" required placeholder="you@company.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sb-phone">Phone Number</Label>
                  <Input id="sb-phone" type="tel" required placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>I want access to</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Select API" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lending">Lending API</SelectItem>
                    <SelectItem value="insurance">Insurance API</SelectItem>
                    <SelectItem value="payments">Payments API</SelectItem>
                    <SelectItem value="multiple">Multiple APIs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sb-usecase">Use case / integration note</Label>
                <Textarea id="sb-usecase" required placeholder="Describe what you plan to build or test" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sb-url">Website or app URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="sb-url" type="url" placeholder="https://yourplatform.com" />
              </div>
              <Button type="submit" size="lg" className="w-full">Request Sandbox Access</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SandboxAccessModal;
