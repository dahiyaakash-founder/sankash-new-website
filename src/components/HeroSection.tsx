import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/50 via-background to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              India's Leading Travel Fintech
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Empower your travel business with the future of{" "}
              <span className="text-gradient-primary">Finance & Technology</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              We bridge the gap between wanderlust and financial feasibility, offering
              innovative solutions for travel agents and customers across India.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 text-base px-8">
                Connect Now <ArrowRight size={18} />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 border-primary/30 text-primary hover:bg-accent">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <img
              src={heroImage}
              alt="Travel suitcase opening to a tropical paradise"
              className="relative rounded-2xl shadow-2xl w-full object-cover"
              width={1024}
              height={768}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
