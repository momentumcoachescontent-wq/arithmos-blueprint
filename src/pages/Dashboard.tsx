import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, MessageCircle, Sparkles, Target, BookOpen, Trophy, Settings, RotateCcw, Shield, Activity, Users, FileText, Scale, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStats } from "@/hooks/useStats";
import { useSubscription } from "@/hooks/useSubscription";
import { useStreak } from "@/hooks/useStreak";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { NarrativeSection } from "@/components/NarrativeSection";
import { CycleChart } from "@/components/CycleChart";
import { DailyPulseCard } from "@/components/DailyPulseCard";
import { TacticalRecommendations } from "@/components/TacticalRecommendations";
import { HistorySection } from "@/components/HistorySection";
import { XPBar } from "@/components/XPBar";
import { BlueprintIndicator } from "@/components/BlueprintIndicator";
import { DailyProtectionShield } from "@/components/DailyProtectionShield";
import { StreakWidget } from "@/components/StreakWidget";
import { TrialBanner } from "@/components/TrialBanner";
import { ArchetypeCard } from "@/components/ArchetypeCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { profile, fetchProfile, syncBlueprintIA } = useProfile();
  const { stats, fetchStats } = useStats(user?.id);
  const { isPremium, isTrialExpired, subscription, daysLeftInTrial, redirectToCheckout } = useSubscription(user?.id);
  const { streak } = useStreak(user?.id);
  const hasAccess = profile?.role === 'admin' || (isPremium && !isTrialExpired);
  const initialized = useRef(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("¡Pago exitoso!", {
        description: "Tu plan Premium se ha activado. ¡Bienvenido a un nuevo nivel!",
      });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    } else if (paymentStatus === "cancelled") {
      toast.error("Pago cancelado", {
        description: "El proceso de pago no fue completado.",
      });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (!initialized.current) {
      const syncData = async () => {
        const p = await fetchProfile(user.id);
        if (!p) {
          navigate("/onboarding");
        }
        await fetchStats(user.id);
      };
      syncData();
      initialized.current = true;
    }
  }, [user, navigate, fetchProfile, fetchStats]);

  if (!user || !profile || !stats) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-serif text-2xl animate-pulse">Sintonizando tu frecuencia...</div>;
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <span className="text-xl font-serif font-bold text-primary">{profile.name[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-muted-foreground font-sans lowercase">hola, {profile.name.split(' ')[0]}</p>
                {profile && <DailyProtectionShield birthDate={profile.birthDate} />}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
                Tu <span className="text-primary italic">Blueprint</span> Estratégico
              </h1>
              {!profile.narrative && (
                <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 w-fit">
                  <WifiOff className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] text-amber-500 font-sans font-bold uppercase tracking-wider">Modo Resiliencia: Matemática Pura</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StreakWidget streak={streak} />
            <XPBar xp={stats.xp} level={stats.level} nextLevelXp={stats.nextLevelXp} progressPercent={stats.progressPercent} />
            <div className="h-10 w-[1px] bg-border mx-2 hidden md:block" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-full hover:bg-secondary"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="rounded-full hover:bg-rose-500/10 text-rose-500"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {subscription && subscription.plan === "trial" && (
          <TrialBanner
            subscription={subscription}
            daysLeft={daysLeftInTrial}
            onUpgrade={redirectToCheckout}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Pulse y Recomendaciones */}
            <div className="grid md:grid-cols-2 gap-6">
              <DailyPulseCard birthDate={profile.birthDate} />
              <TacticalRecommendations birthDate={profile.birthDate} lifePathNumber={profile.lifePathNumber} />
            </div>

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
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl md:text-3xl font-serif font-semibold text-gradient-silver">
                      {profile.archetype}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/onboarding")}
                        className="text-muted-foreground hover:text-primary h-8 gap-2 font-sans text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Recalcular
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              </div>
            </motion.div>

            <NarrativeSection
              narrative={profile.narrative}
              powerStrategy={profile.powerStrategy}
              shadowWork={profile.shadowWork}
              archetypeName={profile.archetype}
              onSync={syncBlueprintIA}
            />

            {/* Extended Blueprint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Expresión", value: profile.expressionNumber, icon: Target },
                { label: "Deseo Alma", value: profile.soulUrgeNumber, icon: Sparkles },
                { label: "Personalidad", value: profile.personalityNumber, icon: BookOpen },
                { label: "Madurez", value: profile.maturityNumber, icon: Activity },
              ].map((item, idx) => (
                <BlueprintIndicator
                  key={idx}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                />
              ))}
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <CycleChart birthDate={profile.birthDate} />
              <ArchetypeCard lifePathNumber={profile.lifePathNumber} archetypeName={profile.archetype} />
            </div>
            {/*
            <div className="mt-8">
              <AudioPlayer url={profile.audioUrl || ""} />
            </div>
            */}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Historial Evolutivo */}
            <HistorySection userId={user.id} />

            {/* Coach AI (Premium) */}
            <ProFeatureGate
              isPremium={hasAccess}
              userId={user.id}
              featureName="Coach de Sombras"
              mode="click"
            >
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => navigate("/coach")}
                className="w-full glass rounded-xl p-6 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent text-left group hover:border-primary/50 transition-all shadow-lg shadow-primary/5"
              >
                <div className="flex items-center gap-3 mb-2 w-full">
                  <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="font-serif text-foreground font-semibold">Coach de Sombras</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-[10px] text-primary font-bold uppercase ml-auto shrink-0">Premium</span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  Conversaciones honestas para transformar tus patrones de sombra en claridad estratégica.
                </p>
                <span className="text-[10px] text-primary font-sans mt-3 block group-hover:underline uppercase tracking-wider font-bold">
                  Iniciar Sesión →
                </span>
              </motion.button>
            </ProFeatureGate>

            {/* Radar de Fricción (Nuevo - Free) */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              onClick={() => navigate("/radar-friccion")}
              className="w-full glass rounded-xl p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent text-left group hover:border-indigo-500/50 transition-all shadow-lg shadow-indigo-500/5"
            >
              <div className="flex items-center gap-3 mb-2 w-full">
                <Scale className="h-5 w-5 text-indigo-400 shrink-0" />
                <h3 className="font-serif text-foreground font-semibold">Radar de Fricción</h3>
              </div>

              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                ¿Sientes inercia? Descubre qué te está frenando hoy y obtén un protocolo de desbloqueo inmediato.
              </p>
              <span className="text-[10px] text-indigo-400 font-sans mt-3 block group-hover:underline uppercase tracking-wider font-bold">
                Iniciar Radar →
              </span>
            </motion.button>

            {/* Acceso a Sincronicidad */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate("/synchronicity")}
              className="w-full glass rounded-xl p-6 border-border bg-primary/5 text-left group hover:border-primary/40 transition-all shadow-lg shadow-primary/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-foreground font-semibold">Consultar Sincronicidad</h3>
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                ¿Has visto un número repetido o una coincidencia hoy? Descifra el mensaje del universo.
              </p>
              <span className="text-[10px] text-primary font-sans mt-3 block group-hover:underline uppercase tracking-wider font-bold">
                Iniciar Consulta →
              </span>
            </motion.button>

            {/* Misiones del Día */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => navigate("/missions")}
              className="w-full glass rounded-xl p-5 border-border bg-secondary/50 text-left group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-foreground font-semibold">Misiones Diarias</h3>
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">Completa tareas para ganar XP y elevar tu frecuencia personal.</p>
            </motion.button>

            {/* Tribunal de Poder */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate("/tribunal-poder")}
              className="w-full glass rounded-xl p-5 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent text-left group hover:border-amber-500/40 transition-all shadow-lg shadow-amber-500/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h3 className="font-serif text-foreground font-semibold">Tribunal de Poder</h3>
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">Simulador de Sinergia Numerológica. Descubre cómo tu frecuencia se combina con otras.</p>
              <span className="text-[10px] text-amber-500 font-sans mt-3 block group-hover:underline uppercase tracking-wider font-bold">
                Iniciar Simulador →
              </span>
            </motion.button>

            {/* Teaser Pro Features */}
            <ProFeatureGate
              isPremium={hasAccess}
              userId={user.id}
              featureName="Radar de Equipo"
              mode="click"
            >
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/radar-equipo")}
                className="w-full glass rounded-xl p-5 border-border bg-indigo-500/5 text-left group hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-2 w-full">
                  <Users className="h-5 w-5 text-indigo-400 shrink-0" />
                  <h3 className="font-serif text-foreground font-semibold">Radar de Equipo</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] text-indigo-400 font-bold uppercase ml-auto shrink-0">Premium</span>
                </div>

                <p className="text-xs text-muted-foreground font-sans leading-relaxed">Analiza la compatibilidad numérica de tu equipo. Identifica fortalezas y tensiones.</p>
                <span className="text-[10px] text-indigo-400 font-sans mt-3 block group-hover:underline uppercase tracking-wider font-bold">Abrir Radar →</span>
              </motion.button>
            </ProFeatureGate>

            <ProFeatureGate
              isPremium={hasAccess}
              userId={user.id}
              featureName="Reporte Deep Dive Anual"
              mode="click"
            >
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/deep-dive")}
                className="w-full glass rounded-xl p-5 border-border bg-emerald-500/5 text-left group hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-2 w-full">
                  <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
                  <h3 className="font-serif text-foreground font-semibold">Reporte Deep Dive Anual</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase ml-auto shrink-0">Premium</span>
                </div>

                <p className="text-xs text-muted-foreground font-sans leading-relaxed">Tu hoja de ruta estratégica para los próximos 12 meses, generada por IA en 15+ páginas.</p>
                <span className="text-[10px] text-emerald-400 font-sans mt-3 block group-hover:underline uppercase tracking-wider font-bold">Solicitar Reporte →</span>
              </motion.button>
            </ProFeatureGate>

            {/* Portal del Arquitecto (Solo Admin) */}
            {profile.role === 'admin' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate("/admin")}
                className="w-full glass rounded-xl p-5 border-primary/30 bg-primary/10 text-left group hover:border-primary/60 transition-all shadow-lg shadow-primary/10 mt-4"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-foreground font-semibold">Portal del Arquitecto</h3>
                </div>
                <p className="text-[10px] text-primary font-sans uppercase tracking-[0.2em] font-bold">Diagnóstico y Control Central</p>
              </motion.button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
