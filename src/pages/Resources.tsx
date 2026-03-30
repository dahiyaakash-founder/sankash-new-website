import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Resources = () => {
  return (
    <SiteLayout>
      <SEOHead
        title="Resources — Travel Finance Guides and Insights | SanKash"
        description="Guides, insights and resources on travel EMI, embedded insurance, payment collection and travel business growth from SanKash."
        noindex
      />
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl text-center space-y-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">Resources</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground">
            Resources & Guides
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Guides, insights and resources on travel financing, embedded insurance, and payment collection — coming soon.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container max-w-2xl text-center space-y-6">
          <p className="text-muted-foreground">
            We're preparing resources to help travel businesses grow with EMI, insurance, and payments. Check back soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/solutions">Explore Solutions <ArrowRight size={14} /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Resources;
