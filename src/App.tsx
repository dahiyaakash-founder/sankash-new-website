import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import ForAgents from "./pages/ForAgents";
import ForTravelers from "./pages/ForTravelers";
import Solutions from "./pages/Solutions";
import Lending from "./pages/Lending";
import Insurance from "./pages/Insurance";
import Payments from "./pages/Payments";
import Developers from "./pages/Developers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/for-agents" element={<ForAgents />} />
          <Route path="/for-travelers" element={<ForTravelers />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solutions/lending" element={<Lending />} />
          <Route path="/solutions/insurance" element={<Insurance />} />
          <Route path="/solutions/payments" element={<Payments />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
