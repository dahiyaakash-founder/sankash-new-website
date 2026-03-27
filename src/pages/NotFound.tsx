import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SiteLayout from "@/components/SiteLayout";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <SiteLayout>
      <SEOHead
        title="Page Not Found | SanKash"
        description="The page you're looking for doesn't exist. Return to SanKash to explore travel lending, insurance, and payment solutions."
      />
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-heading font-bold text-primary-deep">404</h1>
          <p className="text-lg text-muted-foreground">This page doesn't exist.</p>
          <Link to="/" className="inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Return to Home →
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
};

export default NotFound;
