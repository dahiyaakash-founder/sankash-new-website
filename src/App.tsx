import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import RouteTracker from "./components/RouteTracker";

// Eagerly load homepage (critical path)
import Index from "./pages/Index";

// Lazy-load all other pages
const ForAgents = lazy(() => import("./pages/ForAgents"));
const ForTravelAgents = lazy(() => import("./pages/ForTravelAgents"));
const ForTravelers = lazy(() => import("./pages/ForTravelers"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Lending = lazy(() => import("./pages/Lending"));
const Insurance = lazy(() => import("./pages/Insurance"));
const Payments = lazy(() => import("./pages/Payments"));
const Developers = lazy(() => import("./pages/Developers"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const EmiCalculator = lazy(() => import("./pages/EmiCalculator"));
const Resources = lazy(() => import("./pages/Resources"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Security = lazy(() => import("./pages/Security"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LinkRedirect = lazy(() => import("./pages/LinkRedirect"));

// Ops pages — lazy loaded
const OpsLogin = lazy(() => import("./pages/ops/OpsLogin"));
const OpsSetup = lazy(() => import("./pages/ops/OpsSetup"));
const OpsDashboard = lazy(() => import("./pages/ops/OpsDashboard"));
const OpsLeads = lazy(() => import("./pages/ops/OpsLeads"));
const OpsLeadDetail = lazy(() => import("./pages/ops/OpsLeadDetail"));
const OpsTeamManagement = lazy(() => import("./pages/ops/OpsTeamManagement"));
const OpsAcceptInvite = lazy(() => import("./pages/ops/OpsAcceptInvite"));
const ProtectedOpsRoute = lazy(() => import("./components/ops/ProtectedOpsRoute"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <RouteTracker />
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/for-agents" element={<ForAgents />} />
              <Route path="/for-travel-agents" element={<ForTravelAgents />} />
              <Route path="/for-travelers" element={<ForTravelers />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/solutions/lending" element={<Lending />} />
              <Route path="/solutions/insurance" element={<Insurance />} />
              <Route path="/solutions/payments" element={<Payments />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/emi-calculator" element={<EmiCalculator />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/blog" element={<Resources />} />
              <Route path="/guides" element={<Resources />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/security" element={<Security />} />
              <Route path="/link" element={<LinkRedirect />} />
              {/* Legacy .html redirects */}
              <Route path="/contact-us.html" element={<Navigate to="/contact" replace />} />
              <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
              <Route path="/about-us.html" element={<Navigate to="/about" replace />} />
              <Route path="/about-us" element={<Navigate to="/about" replace />} />
              <Route path="/privacy-policy.html" element={<Navigate to="/privacy" replace />} />
              <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
              <Route path="/terms-of-service.html" element={<Navigate to="/terms" replace />} />
              <Route path="/terms-and-conditions.html" element={<Navigate to="/terms" replace />} />
              <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route path="/home.html" element={<Navigate to="/" replace />} />
              <Route path="/solutions.html" element={<Navigate to="/solutions" replace />} />
              <Route path="/developers.html" element={<Navigate to="/developers" replace />} />
              <Route path="/emi-calculator.html" element={<Navigate to="/emi-calculator" replace />} />
              <Route path="/resources.html" element={<Navigate to="/resources" replace />} />
              <Route path="/blog.html" element={<Navigate to="/resources" replace />} />
              <Route path="/insurance.html" element={<Navigate to="/solutions/insurance" replace />} />
              <Route path="/lending.html" element={<Navigate to="/solutions/lending" replace />} />
              <Route path="/payments.html" element={<Navigate to="/solutions/payments" replace />} />
              {/* Legacy app paths — redirect to old app or homepage */}
              <Route path="/customer_check_eligibility/*" element={<LinkRedirect />} />
              <Route path="/cce/*" element={<LinkRedirect />} />
              <Route path="/link/*" element={<LinkRedirect />} />
              <Route path="/qr/*" element={<LinkRedirect />} />
              <Route path="/uat/customer_check_eligibility/*" element={<LinkRedirect />} />
              <Route path="/uat/cce/*" element={<LinkRedirect />} />
              <Route path="/uat/link" element={<LinkRedirect />} />
              <Route path="/uat/link/*" element={<LinkRedirect />} />
              <Route path="/uat/qr/*" element={<LinkRedirect />} />
              <Route path="/dev/customer_check_eligibility/*" element={<LinkRedirect />} />
              <Route path="/dev/cce/*" element={<LinkRedirect />} />
              <Route path="/dev/link" element={<LinkRedirect />} />
              <Route path="/dev/link/*" element={<LinkRedirect />} />
              <Route path="/dev/qr/*" element={<LinkRedirect />} />
              <Route path="/traveler" element={<Navigate to="/for-travelers" replace />} />
              <Route path="/travelers" element={<Navigate to="/for-travelers" replace />} />
              <Route path="/traveler.html" element={<Navigate to="/for-travelers" replace />} />
              <Route path="/dashboard" element={<Navigate to="/ops/login" replace />} />
              <Route path="/agent/*" element={<Navigate to="/" replace />} />
              <Route path="/customer/*" element={<Navigate to="/for-travelers" replace />} />
              <Route path="/ops" element={<Navigate to="/ops/dashboard" replace />} />
              <Route path="/ops/setup" element={<OpsSetup />} />
              <Route path="/ops/login" element={<OpsLogin />} />
              <Route path="/ops/accept-invite" element={<OpsAcceptInvite />} />
              <Route path="/ops/dashboard" element={<Suspense fallback={<LazyFallback />}><ProtectedOpsRoute><OpsDashboard /></ProtectedOpsRoute></Suspense>} />
              <Route path="/ops/leads" element={<Suspense fallback={<LazyFallback />}><ProtectedOpsRoute><OpsLeads /></ProtectedOpsRoute></Suspense>} />
              <Route path="/ops/leads/:id" element={<Suspense fallback={<LazyFallback />}><ProtectedOpsRoute><OpsLeadDetail /></ProtectedOpsRoute></Suspense>} />
              <Route path="/ops/team" element={<Suspense fallback={<LazyFallback />}><ProtectedOpsRoute><OpsTeamManagement /></ProtectedOpsRoute></Suspense>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
