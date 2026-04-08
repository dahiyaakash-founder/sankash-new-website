import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, IndianRupee, CalendarDays, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { createLeadWithDedup } from "@/lib/leads-service";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const BUDGET_OPTIONS = [
  { value: "under_50k", label: "Under ₹50,000" },
  { value: "50k_1l", label: "₹50,000 – ₹1,00,000" },
  { value: "1l_2l", label: "₹1,00,000 – ₹2,00,000" },
  { value: "2l_5l", label: "₹2,00,000 – ₹5,00,000" },
  { value: "above_5l", label: "Above ₹5,00,000" },
];

const TravelerEmiEnquiry = () => {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [travelMonth, setTravelMonth] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mobileValid = /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""));
  const canSubmit = destination.trim() && budget && travelMonth && mobileValid && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const budgetLabel = BUDGET_OPTIONS.find(b => b.value === budget)?.label ?? budget;
      await createLeadWithDedup({
        full_name: "Traveler Enquiry",
        mobile_number: mobile.replace(/\s/g, ""),
        audience_type: "traveler",
        lead_source_page: "/for-travelers",
        lead_source_type: "traveler_emi_enquiry" as any,
        emi_flag: true,
        destination_type: destination.trim(),
        message: `Holiday EMI enquiry: ${destination.trim()}, budget ${budgetLabel}, travel month ${travelMonth}`,
        metadata_json: {
          enquiry_destination: destination.trim(),
          enquiry_budget: budget,
          enquiry_budget_label: budgetLabel,
          enquiry_travel_month: travelMonth,
        },
      });

      trackEvent("traveler_emi_enquiry", {
        source_type: "traveler_emi_enquiry",
        audience_type: "traveler",
        destination: destination.trim(),
        budget,
      });

      setSubmitted(true);
      toast.success("Enquiry submitted! We'll reach out shortly.");
    } catch (err: any) {
      const msg = err?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-card shadow-card p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} className="text-brand-green" />
        </div>
        <h3 className="font-heading font-bold text-foreground text-lg">Enquiry received</h3>
        <p className="text-sm text-muted-foreground">
          Our team will review your holiday EMI options and reach out on your mobile number shortly.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            setDestination("");
            setBudget("");
            setTravelMonth("");
            setMobile("");
          }}
        >
          Submit another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card shadow-card p-5 space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">
          No quote yet?
        </p>
        <h3 className="font-heading font-bold text-foreground text-base sm:text-lg leading-snug">
          Planning a holiday? Check EMI options first.
        </h3>
        <p className="text-xs text-muted-foreground">
          Tell us where you want to go — we'll show you what it could cost per month.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="emi-destination" className="text-xs font-medium flex items-center gap-1.5">
            <MapPin size={12} className="text-primary" /> Where are you going?
          </Label>
          <Input
            id="emi-destination"
            placeholder="e.g. Bali, Europe, Kashmir"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emi-budget" className="text-xs font-medium flex items-center gap-1.5">
            <IndianRupee size={12} className="text-primary" /> Approximate budget
          </Label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger id="emi-budget">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emi-month" className="text-xs font-medium flex items-center gap-1.5">
            <CalendarDays size={12} className="text-primary" /> When do you want to travel?
          </Label>
          <Select value={travelMonth} onValueChange={setTravelMonth}>
            <SelectTrigger id="emi-month">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emi-mobile" className="text-xs font-medium flex items-center gap-1.5">
            <Phone size={12} className="text-primary" /> Mobile number
          </Label>
          <Input
            id="emi-mobile"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/[^0-9\s]/g, "").slice(0, 10))}
            maxLength={10}
          />
          {mobile.length > 0 && !mobileValid && (
            <p className="text-[11px] text-destructive">Enter a valid 10-digit mobile number</p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={!canSubmit}>
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting...
          </>
        ) : (
          "Check My EMI Options"
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground text-center">
        No spam. No credit score impact. We'll share indicative EMI options based on your trip details.
      </p>
    </form>
  );
};

export default TravelerEmiEnquiry;
