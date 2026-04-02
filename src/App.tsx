import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index";
import ForAgents from "./pages/ForAgents";
import ForTravelAgents from "./pages/ForTravelAgents";
import ForTravelers from "./pages/ForTravelers";
import Solutions from "./pages/Solutions";
import Lending from "./pages/Lending";
import Insurance from "./pages/Insurance";
import Payments from "./pages/Payments";
import Developers from "./pages/Developers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EmiCalculator from "./pages/EmiCalculator";
import Resources from "./pages/Resources";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";
import LinkRedirect from "./pages/LinkRedirect";
import OpsLogin from "./pages/ops/OpsLogin";
import OpsSetup from "./pages/ops/OpsSetup";
import OpsDashboard from "./pages/ops/OpsDashboard";
import OpsLeads from "./pages/ops/OpsLeads";
import OpsLeadDetail from "./pages/ops/OpsLeadDetail";
import OpsTeamManagement from "./pages/ops/OpsTeamManagement";
import OpsAcceptInvite from "./pages/ops/OpsAcceptInvite";
import ProtectedOpsRoute from "./components/ops/ProtectedOpsRoute";
import RouteTracker from "./components/RouteTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <RouteTracker />
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
            {/* Ops Dashboard — protected */}
            <Route path="/ops/setup" element={<OpsSetup />} />
            <Route path="/ops/login" element={<OpsLogin />} />
            <Route path="/ops/accept-invite" element={<OpsAcceptInvite />} />
            <Route path="/ops/dashboard" element={<ProtectedOpsRoute><OpsDashboard /></ProtectedOpsRoute>} />
            <Route path="/ops/leads" element={<ProtectedOpsRoute><OpsLeads /></ProtectedOpsRoute>} />
            <Route path="/ops/leads/:id" element={<ProtectedOpsRoute><OpsLeadDetail /></ProtectedOpsRoute>} />
            <Route path="/ops/team" element={<ProtectedOpsRoute><OpsTeamManagement /></ProtectedOpsRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
