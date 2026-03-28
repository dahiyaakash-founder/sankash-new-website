import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface IntegrationQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IntegrationQuestionModal = ({ open, onOpenChange }: IntegrationQuestionModalProps) => {
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
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <DialogHeader className="sm:text-center">
              <DialogTitle className="text-xl font-heading">Your question has been submitted</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Our integration team will respond on your work email.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} variant="outline" className="mt-4">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-heading">Ask an integration question</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Our team will respond with integration guidance on your work email.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="iq-name">Name</Label>
                <Input id="iq-name" required placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iq-email">Work Email</Label>
                <Input id="iq-email" type="email" required placeholder="you@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Product of interest</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lending">Lending API</SelectItem>
                    <SelectItem value="insurance">Insurance API</SelectItem>
                    <SelectItem value="payments">Payments API</SelectItem>
                    <SelectItem value="general">General integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iq-question">Question</Label>
                <Textarea id="iq-question" required placeholder="What do you need help with?" rows={4} />
              </div>
              <Button type="submit" size="lg" className="w-full">Send Question</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationQuestionModal;
