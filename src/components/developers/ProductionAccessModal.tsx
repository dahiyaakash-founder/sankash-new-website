import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface ProductionAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductionAccessModal = ({ open, onOpenChange }: ProductionAccessModalProps) => {
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
              <DialogTitle className="text-xl font-heading">Production access request received</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Our team will review your production request and reach out with the next steps.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} variant="outline" className="mt-4">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-heading">Request production access</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Share your integration details and our team will review production access for your platform.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-name">Full Name</Label>
                  <Input id="prod-name" required placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-company">Company Name</Label>
                  <Input id="prod-company" required placeholder="Company" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-email">Work Email</Label>
                  <Input id="prod-email" type="email" required placeholder="you@company.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-phone">Phone Number</Label>
                  <Input id="prod-phone" type="tel" required placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Product needed</Label>
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
                  <Label>Integration status</Label>
                  <Select required>
                    <SelectTrigger><SelectValue placeholder="Current stage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exploring">Exploring</SelectItem>
                      <SelectItem value="in-development">In development</SelectItem>
                      <SelectItem value="ready">Ready to go live</SelectItem>
                      <SelectItem value="sandbox-tested">Already tested in sandbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-volume">Expected monthly volume</Label>
                <Input id="prod-volume" required placeholder="e.g. 500 transactions / month" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-usecase">Business use case</Label>
                <Textarea id="prod-usecase" required placeholder="Describe your integration and business context" rows={3} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-tech-name">Technical contact name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="prod-tech-name" placeholder="Technical lead" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-tech-email">Technical contact email <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="prod-tech-email" type="email" placeholder="tech@company.com" />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full">Request Production Access</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductionAccessModal;
