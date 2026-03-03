import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, MessageCircle, Sparkles, ExternalLink, Target, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStats } from "@/hooks/useStats";
import { NarrativeSection } from "@/components/NarrativeSection";
import { CycleChart } from "@/components/CycleChart";
import { DailyPulseCard } from "@/components/DailyPulseCard";
import { XPBar } from "@/components/XPBar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { profile, fetchProfile, createProfile } = useProfile();
  const { stats, fetchStats } = useStats(user?.id);
  const isSyncing = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/onboarding");
      return;
    }

    const syncData = async () => {
      if (isSyncing.current || !user?.id) return;

      // Si el perfil falta o está incompleto localmente
      if (!profile || profile.expressionNumber === undefined) {
        isSyncing.current = true;
        try {
          console.log("Sincronizando perfil...");
          const fetched = await fetchProfile(user.id);

          // Si tras fetch sigue incompleto en DB, forzamos recalculo con n8n
          if (fetched && fetched.expressionNumber === undefined && fetched.name && fetched.birthDate) {
            console.log("Perfil incompleto detectado en DB. Reparando con n8n...");
            await createProfile(fetched.name, fetched.birthDate, user.id);
          } else if (!fetched && !profile) {
            navigate("/onboarding");
          }
        } catch (err) {
          console.error("Error en sincronización:", err);
        } finally {
          isSyncing.current = false;
        }
      }
    };

    syncData();
    fetchStats();
  }, [isAuthenticated, user?.id, profile?.expressionNumber, fetchProfile, createProfile, navigate, fetchStats]);

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
            {stats && <XPBar {...stats} compact />}
            <span className="text-sm text-muted-foreground font-sans hidden sm:block">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Pulse en vivo */}
            <DailyPulseCard birthDate={profile.birthDate} />

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

            {/* Extended Blueprint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Expresión", value: profile.expressionNumber },
                { label: "Deseo del Alma", value: profile.soulUrgeNumber },
                { label: "Personalidad", value: profile.personalityNumber },
                { label: "Madurez", value: profile.maturityNumber }
              ].map((item, idx) => (
                <div key={idx} className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-sans">{item.label}</span>
                  <span className="text-2xl font-serif font-bold text-foreground">{item.value || "-"}</span>
                </div>
              ))}
            </motion.div>

            {/* Narrativa IA (Fase 2) */}
            <NarrativeSection
              narrative={profile.narrative}
              powerStrategy={profile.powerStrategy}
              shadowWork={profile.shadowWork}
              archetypeName={profile.archetype}
            />

            {/* Ciclos Personales (Fase 2) */}
            <CycleChart birthDate={profile.birthDate} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Misiones del Día */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate("/missions")}
              className="w-full glass rounded-xl p-5 border-border text-left group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-foreground">Misiones del Día</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Desafíos calibrados a tu número personal de hoy. Completa misiones y acumula XP.
              </p>
              <span className="text-xs text-primary font-sans mt-3 block group-hover:underline">
                Ir a Misiones →
              </span>
            </motion.button>

            {/* Diario de Sombras */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate("/journal")}
              className="w-full glass rounded-xl p-5 border-border text-left group hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <h3 className="font-serif text-foreground">Diario de Sombras</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                El espacio privado donde la oscuridad se convierte en claridad estratégica.
              </p>
              <span className="text-xs text-amber-400 font-sans mt-3 block group-hover:underline">
                Ir al Diario →
              </span>
            </motion.button>

            {/* Tribunal de Poder */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate("/ranking")}
              className="w-full glass rounded-xl p-5 border-border text-left group hover:border-amber-400/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="font-serif text-foreground">Tribunal de Poder</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Los estrategas con mayor reconocimiento por su transformación y práctica.
              </p>
              <span className="text-xs text-amber-400 font-sans mt-3 block group-hover:underline">
                Ver Ranking →
              </span>
            </motion.button>

            {/* Discord CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-5 border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <h3 className="font-serif text-foreground text-sm">Conecta Discord</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4 font-sans">
                Recibe el Daily Pulse directo en tu servidor.
              </p>
              <Button className="w-full glow-indigo group" size="sm">
                Activar
                <ExternalLink className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

