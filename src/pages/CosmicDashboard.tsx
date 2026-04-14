import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStats } from "@/hooks/useStats";
import { useSubscription } from "@/hooks/useSubscription";
import { useCosmicStreak } from "@/hooks/useCosmicStreak";
import { CosmicShell, CosmicBottomNav, type CosmicNavItem } from "@/ui/CosmicShell";
import { CosmicFeed } from "@/features/cosmic-feed/CosmicFeedView";
import { TarotSpreadsView } from "@/features/tarot/TarotSpreadsView";
import { generateCosmicDay } from "@/engines/cosmic-feed";
import { CosmicNotifications } from "@/features/match/CosmicNotifications";
import { ARCHETYPES } from "@/hooks/useProfile";

import { calculateNatalProfile } from "@/engines/astrology/natal-chart";

/* ============================================
   TAB: MAPA — Profile + Natal Chart
   ============================================ */

function CosmicMapaTab({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>["profile"]> }) {
  const natal = useMemo(() => calculateNatalProfile(profile.birthDate), [profile.birthDate]);

  return (
    <div className="px-4 py-8 space-y-10">
      {/* Header Profile */}
      <div className="text-center">
        <h1
          className="text-4xl font-bold mb-2 lowercase italic"
          style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 98%)" }}
        >
          {profile.name}
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-violet-400">
          ✨ {profile.archetype}
        </div>
      </div>

      {/* Astro Summary Card */}
      <div
        className="text-center italic text-sm leading-relaxed px-4"
        style={{
          fontFamily: "var(--cosm-font-body)",
          color: "hsl(260 10% 65%)",
        }}
      >
        {natal.cosmicSummary}
      </div>

      {/* Numerology Numbers */}
      <div>
        <h2
          className="text-sm font-semibold mb-3"
          style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 90%)" }}
        >
          Tus Números
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Camino de Vida", value: profile.lifePathNumber, emoji: "🛤️" },
            { label: "Expresión", value: profile.expressionNumber, emoji: "🗣️" },
            { label: "Impulso del Alma", value: profile.soulUrgeNumber, emoji: "💫" },
            { label: "Personalidad", value: profile.personalityNumber, emoji: "🎭" },
          ].map((num) => (
            <div
              key={num.label}
              className="cosmic-card flex items-center gap-3 p-3"
            >
              <span className="text-lg">{num.emoji}</span>
              <div>
                <span
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--cosm-font-display)",
                    color: "hsl(45 90% 65%)",
                  }}
                >
                  {num.value || "—"}
                </span>
                <p
                  className="text-[10px]"
                  style={{ color: "hsl(260 8% 50%)" }}
                >
                  {num.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   TAB: YO — Settings & Stats
   ============================================ */

function CosmicYoTab({
  profile,
  stats,
  streak,
  logout,
}: {
  profile: NonNullable<ReturnType<typeof useProfile>["profile"]>;
  stats: { xp: number; level: number };
  streak: number;
  logout: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-2">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold"
          style={{
            background: "linear-gradient(135deg, hsl(270 80% 65%), hsl(310 80% 60%))",
            fontFamily: "var(--cosm-font-display)",
            color: "hsl(0 0% 98%)",
          }}
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
          >
            {profile.name}
          </h2>
          <p
            className="text-xs"
            style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 10% 55%)" }}
          >
            {profile.archetype}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "XP", value: stats.xp, emoji: "⚡" },
          { label: "Nivel", value: stats.level, emoji: "🏆" },
          { label: "Racha", value: `${streak}d`, emoji: "🔥" },
        ].map((stat) => (
          <div key={stat.label} className="cosmic-card p-3 text-center">
            <span className="text-sm">{stat.emoji}</span>
            <p
              className="text-lg font-bold mt-1"
              style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 90%)" }}
            >
              {stat.value}
            </p>
            <p className="text-[10px]" style={{ color: "hsl(260 8% 45%)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        {[
          { label: "Diario Cósmico", icon: "📓", route: "/journal" },
          { label: "Compatibilidad (1 a 1)", icon: "💞", route: "/compatibility" },
          { label: "Radar Cósmico (Social)", icon: "📡", route: "/radar" },
          { label: "Configuración", icon: "⚙️", route: "/settings" },
          { label: "Coach IA", icon: "🧠", route: "/coach" },
        ].map((link) => (
          <button
            key={link.route}
            onClick={() => navigate(link.route)}
            className="cosmic-card cosmic-glass-hover w-full flex items-center gap-3 p-3 text-left"
          >
            <span className="text-lg">{link.icon}</span>
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(0 0% 88%)" }}
            >
              {link.label}
            </span>
          </button>
        ))}
      </div>

      {/* Activity Feed (Cosmic Notifications) */}
      <div className="mt-8">
        <CosmicNotifications userId={profile.userId} />
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full mt-4 text-center text-xs py-3"
        style={{ fontFamily: "var(--cosm-font-body)", color: "hsl(260 8% 40%)" }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

/* ============================================
   COSMIC DASHBOARD — Main page
   ============================================ */

type CosmicTab = "cosmos" | "tarot" | "mapa" | "yo";

const NAV_ITEMS: CosmicNavItem[] = [
  { id: "cosmos", label: "Cosmos", icon: "✨" },
  { id: "tarot", label: "Tarot", icon: "🔮" },
  { id: "mapa", label: "Mapa", icon: "🗺️", primary: true },
  { id: "yo", label: "Yo", icon: "👤" },
];

const CosmicDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<CosmicTab>("cosmos");

  const { user, logout } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const { stats, fetchStats, awardXp } = useStats(user?.id);
  const { isPremium, isTrialExpired } = useSubscription(user?.id);
  const { streak, checkin } = useCosmicStreak(user?.id);

  const initialized = useRef(false);

  // Payment redirect handling
  useEffect(() => {
    const status = searchParams.get("payment");
    if (status === "success") {
      toast.success("¡Pago exitoso!", { description: "Tu plan Pro se ha activado." });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    } else if (status === "cancelled") {
      toast.error("Pago cancelado", { description: "El proceso no fue completado." });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Auth + profile initialization
  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!initialized.current) {
      const init = async () => {
        const p = await fetchProfile(user.id);
        if (!p) navigate("/register");
        await fetchStats(user.id);
        await checkin();
      };
      init();
      initialized.current = true;
    }
  }, [user, navigate, fetchProfile, fetchStats]);

  // Generate cosmic reading
  const cosmicReading = useMemo(() => {
    if (!user || !profile) return null;
    return generateCosmicDay(
      user.id,
      profile.birthDate,
      profile.lifePathNumber
    );
  }, [user, profile]);

  // Loading state
  if (!user || !profile || !stats) {
    return (
      <CosmicShell particles particlePalette="violet">
        <div className="flex min-h-screen items-center justify-center">
          <motion.p
            className="text-lg"
            style={{
              fontFamily: "var(--cosm-font-display)",
              color: "hsl(270 80% 70%)",
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Sintonizando tu frecuencia cósmica...
          </motion.p>
        </div>
      </CosmicShell>
    );
  }

  return (
    <CosmicShell particles particlePalette="mixed">
      {/* Scrollable content */}
      <div className="pb-24 overflow-y-auto min-h-screen no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "cosmos" && (
              <div className="px-4 py-6 space-y-6">
                {/* HERO CARD: TAROT REELS */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/reels")}
                  className="w-full h-40 rounded-[32px] p-6 relative overflow-hidden text-left"
                  style={{
                    background: "linear-gradient(135deg, hsl(270 80% 25%), hsl(310 80% 20%))",
                    border: "1px solid hsla(270 80% 50% / 0.4)",
                    boxShadow: "0 20px 40px -10px hsla(270 80% 50% / 0.3)",
                  }}
                >
                  <div className="absolute top-0 right-0 p-4 text-4xl opacity-20">🎞️</div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl bg-pink-500/20"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-pink-300 mb-1">Nuevo · Viral</span>
                    <h3 className="text-xl font-bold mb-2 leading-tight" style={{ fontFamily: "var(--cosm-font-display)", color: "white" }}>
                      Tu Destino en 15"
                    </h3>
                    <p className="text-xs text-white/60 mb-auto">Tarot interactivo en formato Reel.</p>
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white tracking-widest">
                      Ver ahora <span>✨</span>
                    </div>
                  </div>
                </motion.button>

                {cosmicReading && <CosmicFeed reading={cosmicReading} />}
              </div>
            )}
            
            {activeTab === "tarot" && <TarotSpreadsView />}
            {activeTab === "mapa" && <CosmicMapaTab profile={profile} />}
            {activeTab === "yo" && (
              <CosmicYoTab
                profile={profile}
                stats={stats}
                streak={streak}
                logout={logout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <CosmicBottomNav
        items={NAV_ITEMS}
        active={activeTab}
        onChange={(id) => setActiveTab(id as CosmicTab)}
      />
    </CosmicShell>
  );
};

export default CosmicDashboard;
