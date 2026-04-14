import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// Arithmos AI Strategist - Production Build v1.2.7
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Register from "./pages/Register";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Missions = lazy(() => import("./pages/Missions"));
const Journal = lazy(() => import("./pages/Journal"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Settings = lazy(() => import("./pages/Settings"));
const Synchronicity = lazy(() => import("./pages/Synchronicity"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const RadarEquipo = lazy(() => import("./pages/RadarEquipo"));
const DeepDive = lazy(() => import("./pages/DeepDive"));
const TribunalPoder = lazy(() => import("./pages/TribunalPoder"));
const Evolucion = lazy(() => import("./pages/Evolucion"));
const CoachChat = lazy(() => import("./pages/CoachChat"));
const FrictionRadar = lazy(() => import("./pages/FrictionRadar"));
const CalendarioNumerico = lazy(() => import("./pages/CalendarioNumerico"));
const HorasDelDia = lazy(() => import("./pages/HorasDelDia"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

