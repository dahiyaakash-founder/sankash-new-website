import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-background rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">
          Ready to transform your travel business?
        </h2>
        <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8 text-lg">
          Join 8,000+ travel agents already using SanKash to grow their business.
        </p>
        <Button
          size="lg"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 text-base px-8 font-bold"
        >
          Get Started Today <ArrowRight size={18} />
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
