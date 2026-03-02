import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, MessageCircle, History, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const MOCK_READINGS = [
  { date: "2026-03-01", type: "Daily Pulse", summary: "Día de número 7: Ideal para análisis profundo y planificación estratégica silenciosa." },
  { date: "2026-02-28", type: "Ciclo Personal", summary: "Entrando en mes personal 3: Momento de comunicar tu visión y expandir tu red." },
  { date: "2026-02-25", type: "Alerta de Sincronicidad", summary: "Patrón 11:11 detectado en tus métricas. Ventana de manifestación activa." },
];

const MOCK_SYNC_LOGS = [
  { timestamp: "2026-03-01 09:14", event: "Número maestro 22 en tu tránsito diario" },
  { timestamp: "2026-02-27 15:30", event: "Alineación triple entre día personal, mes y año" },
  { timestamp: "2026-02-24 11:11", event: "Sincronicidad numérica: patrón 1-1-1 activo" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (!isAuthenticated || !profile) {
      navigate("/onboarding");
    }
  }, [isAuthenticated, profile, navigate]);

  if (!profile || !user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg text-foreground">Arithmos</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-sans">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Life Path Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-8 glow-indigo"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-bronze mb-4 font-sans">Tu Camino de Vida</p>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-4xl font-serif font-bold text-primary">{profile.lifePathNumber}</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2">
                    {profile.archetype}
                  </h1>
                  <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Reading History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4 text-bronze" />
                <h2 className="text-lg font-serif text-foreground">Historial de Lecturas</h2>
              </div>
              <div className="space-y-3">
                {MOCK_READINGS.map((r, i) => (
                  <div key={i} className="glass rounded-lg p-5 glass-hover">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-muted-foreground font-sans">{r.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-sans">{r.type}</span>
                    </div>
                    <p className="text-sm text-secondary-foreground font-sans">{r.summary}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Discord CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 border-primary/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-foreground">Conecta Discord</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5 font-sans">
                Activa tu conexión para recibir el Daily Pulse y soporte estratégico on-demand directamente en tu servidor.
              </p>
              <Button className="w-full glow-indigo group" size="sm">
                Activar conexión
                <ExternalLink className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>

            {/* Sync Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-bronze" />
                <h3 className="font-serif text-foreground">Logs de Sincronicidad</h3>
              </div>
              <div className="space-y-3">
                {MOCK_SYNC_LOGS.map((log, i) => (
                  <div key={i} className="glass rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1 font-sans">{log.timestamp}</p>
                    <p className="text-sm text-secondary-foreground font-sans">{log.event}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
