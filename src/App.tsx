import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects/:id" element={<ProjectWorkspace />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/upgrade" element={<Pricing />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <PWAInstallPrompt />
  </TooltipProvider>
);

export default App;
