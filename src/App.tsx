import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// Arithmos AI Strategist - Production Build v1.2.7
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import Journal from "./pages/Journal";
import Ranking from "./pages/Ranking";
import Settings from "./pages/Settings";
import Synchronicity from "./pages/Synchronicity";
import AdminDashboard from "./pages/AdminDashboard";
import RadarEquipo from "./pages/RadarEquipo";
import DeepDive from "./pages/DeepDive";
import TribunalPoder from "./pages/TribunalPoder";
import Evolucion from "./pages/Evolucion";
import CoachChat from "./pages/CoachChat";
import FrictionRadar from "./pages/FrictionRadar";
import CalendarioNumerico from "./pages/CalendarioNumerico";
import HorasDelDia from "./pages/HorasDelDia";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
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
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/synchronicity" element={<Synchronicity />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/radar-equipo" element={<RadarEquipo />} />
          <Route path="/deep-dive" element={<DeepDive />} />
          <Route path="/tribunal-poder" element={<TribunalPoder />} />
          <Route path="/evolucion" element={<Evolucion />} />
          <Route path="/coach" element={<CoachChat />} />
          <Route path="/radar-friccion" element={<FrictionRadar />} />
          <Route path="/calendario" element={<CalendarioNumerico />} />
          <Route path="/horas" element={<HorasDelDia />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/privasidad" element={<PrivacyPolicy />} />
          <Route path="/delete-account" element={<DataDeletion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

