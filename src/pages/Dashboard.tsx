import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, MessageCircle, Sparkles, Target, BookOpen, Trophy, Settings, RotateCcw, Shield, Activity, Users, FileText, Scale, Calendar, Clock } from "lucide-react";
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
import { BlueprintIndicator } from "@/components/BlueprintIndicator";
import { DailyProtectionShield } from "@/components/DailyProtectionShield";
import { StreakWidget } from "@/components/StreakWidget";
import { TrialBanner } from "@/components/TrialBanner";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { XPBar } from "@/components/XPBar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { profile, fetchProfile, syncBlueprintIA } = useProfile();
  const { stats, fetchStats } = useStats(user?.id);
  const { isPremium, isTrialExpired, subscription, daysLeftInTrial, redirectToCheckout } = useSubscription(user?.id);
  const { streak } = useStreak(user?.id);
  const hasAccess = profile?.role === "admin" || (isPremium && !isTrialExpired);
  const initialized = useRef(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("¡Pago exitoso!", { description: "Tu plan Pro se ha activado." });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    } else if (paymentStatus === "cancelled") {
      toast.error("Pago cancelado", { description: "El proceso no fue completado." });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!initialized.current) {
      const syncData = async () => {
        const p = await fetchProfile(user.id);
        if (!p) navigate("/onboarding");
        await fetchStats(user.id);
      };
      syncData();
      initialized.current = true;
    }
  }, [user, navigate, fetchProfile, fetchStats]);

  if (!user || !profile || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-serif text-2xl text-muted-foreground animate-pulse">Sintonizando tu frecuencia...</p>
      </div>
    );
  }

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Top bar: actions */}
          <div className="flex items-center justify-end gap-2 mb-6">
            <DailyProtectionShield birthDate={profile.birthDate} />
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="rounded-full hover:bg-secondary">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="rounded-full hover:bg-rose-500/10 text-rose-500">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Hero content */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Big life path number */}
              <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="font-serif font-bold text-primary" style={{ fontSize: "2.75rem", lineHeight: 1 }}>
                  {profile.lifePathNumber}
                </span>
              </div>

              <div>
                <p className="text-sm font-sans text-muted-foreground mb-0.5 lowercase tracking-wide">
                  hola, {firstName}
                </p>
                <h1 className="font-serif font-bold text-foreground tracking-tight leading-none mb-2" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
                  {profile.archetype}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-sans text-muted-foreground uppercase tracking-[0.2em]">
                    Camino de Vida · {profile.lifePathNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/onboarding")}
                    className="h-6 px-2 text-muted-foreground hover:text-primary text-[10px] font-sans gap-1"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    Recalcular
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-3 shrink-0">
              <StreakWidget streak={streak} />
              <div className="h-8 w-[1px] bg-border" />
              <XPBar xp={stats.xp} level={stats.level} nextLevelXp={stats.nextLevelXp} progressPercent={stats.progressPercent} compact />
            </div>
          </div>
        </motion.div>

        {/* ── TRIAL BANNER ─────────────────────────────────────── */}
        {subscription?.plan === "trial" && (
          <TrialBanner
            subscription={subscription}
            daysLeft={daysLeftInTrial}
            onUpgrade={redirectToCheckout}
          />
        )}

        {/* ── MAIN GRID ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── COLUMNA PRINCIPAL (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pulso del Día — full width, centerpiece */}
            <DailyPulseCard birthDate={profile.birthDate} />

            {/* Acciones + Arquetipo */}
            <div className="grid md:grid-cols-2 gap-6">
              <TacticalRecommendations birthDate={profile.birthDate} lifePathNumber={profile.lifePathNumber} />
              <ArchetypeCard lifePathNumber={profile.lifePathNumber} archetypeName={profile.archetype} />
            </div>

            {/* Números del Blueprint */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {[
                { label: "Expresión", value: profile.expressionNumber, icon: Target },
                { label: "Deseo del Alma", value: profile.soulUrgeNumber, icon: Sparkles },
                { label: "Personalidad", value: profile.personalityNumber, icon: BookOpen },
                { label: "Madurez", value: profile.maturityNumber, icon: Activity },
              ].map((item, idx) => (
                <BlueprintIndicator key={idx} label={item.label} value={item.value} icon={item.icon} />
              ))}
            </motion.div>

            {/* Ciclos */}
            <CycleChart birthDate={profile.birthDate} />

            {/* Narrativa IA — debajo del fold */}
            <NarrativeSection
              narrative={profile.narrative}
              powerStrategy={profile.powerStrategy}
              shadowWork={profile.shadowWork}
              archetypeName={profile.archetype}
              onSync={syncBlueprintIA}
            />
          </div>

          {/* ── SIDEBAR (1/3) ── */}
          <div className="space-y-4">

            {/* Coach — CTA principal */}
            <ProFeatureGate isPremium={hasAccess} userId={user.id} featureName="Coach de Sombras" mode="click">
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/coach")}
                className="w-full bg-card border border-primary/25 rounded-xl p-6 text-left group hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span className="font-serif text-foreground font-semibold">Coach de Sombras</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-[10px] text-primary font-bold uppercase tracking-wider">Pro</span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed mb-4">
                  Conversaciones honestas para transformar tus patrones de sombra en claridad estratégica.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-sans font-bold uppercase tracking-wider group-hover:underline">
                    Iniciar sesión →
                  </span>
                </div>
              </motion.button>
            </ProFeatureGate>

            {/* Herramientas gratuitas — grid 2×2 */}
            <div>
              <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Herramientas</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Calendario", icon: Calendar, color: "text-primary", path: "/calendario" },
                  { label: "Horas del Día", icon: Clock, color: "text-amber-400", path: "/horas" },
                  { label: "Radar de Fricción", icon: Scale, color: "text-indigo-400", path: "/radar-friccion" },
                  { label: "Sincronicidad", icon: Sparkles, color: "text-primary", path: "/synchronicity" },
                  { label: "Misiones", icon: Target, color: "text-primary", path: "/missions" },
                  { label: "Tribunal de Poder", icon: Trophy, color: "text-amber-400", path: "/tribunal-poder" },
                ].map(({ label, icon: Icon, color, path }) => (
                  <motion.button
                    key={path}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate(path)}
                    className="bg-card border border-border rounded-xl p-4 text-left hover:border-border/80 hover:bg-secondary/50 transition-all group"
                  >
                    <Icon className={`h-4 w-4 ${color} mb-2`} />
                    <p className="text-xs font-sans text-foreground/80 font-medium leading-tight">{label}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Historial */}
            <HistorySection userId={user.id} />

            {/* Pro features */}
            <div>
              <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Exclusivo Pro</p>
              <div className="space-y-3">
                <ProFeatureGate isPremium={hasAccess} userId={user.id} featureName="Radar de Equipo" mode="click">
                  <button
                    onClick={() => navigate("/radar-equipo")}
                    className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm font-sans text-foreground/80">Radar de Equipo</span>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-sans font-bold uppercase">Pro →</span>
                    </div>
                  </button>
                </ProFeatureGate>

                <ProFeatureGate isPremium={hasAccess} userId={user.id} featureName="Reporte Deep Dive" mode="click">
                  <button
                    onClick={() => navigate("/deep-dive")}
                    className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-sans text-foreground/80">Deep Dive Anual</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase">Pro →</span>
                    </div>
                  </button>
                </ProFeatureGate>
              </div>
            </div>

            {/* Admin */}
            {profile.role === "admin" && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate("/admin")}
                className="w-full bg-primary/10 border border-primary/25 rounded-xl p-4 text-left hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-sans text-foreground font-medium">Portal del Arquitecto</span>
                </div>
              </motion.button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
