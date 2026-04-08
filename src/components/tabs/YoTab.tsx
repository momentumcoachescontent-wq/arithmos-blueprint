import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, Shield, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistorySection } from "@/components/HistorySection";
import { TrialBanner } from "@/components/TrialBanner";
import type { Subscription } from "@/hooks/useSubscription";
import type { UserStats } from "@/hooks/useStats";

interface YoTabProps {
  userId: string;
  profile: {
    name: string;
    lifePathNumber: number;
    archetype: string;
    role: string;
  };
  stats: UserStats;
  subscription: Subscription | null;
  isPremium: boolean;
  isTrialExpired: boolean;
  daysLeftInTrial: number;
  redirectToCheckout: () => void;
  logout: () => void;
}

export function YoTab({
  userId, profile, stats, subscription,
  isPremium, isTrialExpired, daysLeftInTrial,
  redirectToCheckout, logout,
}: YoTabProps) {
  const navigate = useNavigate();
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="px-4 pt-6 pb-6 space-y-5 max-w-lg mx-auto">

      {/* ── Profile card ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="font-serif font-bold text-primary text-xl">{profile.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs text-muted-foreground mb-0.5">hola,</p>
          <p className="font-serif font-bold text-xl text-foreground leading-tight truncate">{firstName}</p>
          <p className="text-xs font-sans text-muted-foreground mt-0.5">
            {profile.archetype} · Camino {profile.lifePathNumber}
          </p>
        </div>
      </motion.div>

      {/* ── Trial / Plan ── */}
      {subscription?.plan === "trial" && (
        <TrialBanner
          subscription={subscription}
          daysLeft={daysLeftInTrial}
          onUpgrade={redirectToCheckout}
        />
      )}

      {subscription?.plan === "pro" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4"
        >
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-sans font-semibold text-primary">Plan Pro activo</p>
            <p className="text-xs font-sans text-muted-foreground">Acceso completo desbloqueado</p>
          </div>
        </motion.div>
      )}

      {/* ── Stats strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "Nivel", value: stats.level, icon: Trophy, color: "text-amber-400" },
          { label: "XP total", value: stats.xp, icon: Zap, color: "text-primary" },
          { label: "Siguiente", value: `${stats.nextLevelXp} XP`, icon: null, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`font-serif font-bold text-xl tabular-nums ${color}`}>{value}</p>
            <p className="text-[9px] font-sans text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Historial ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
          Historial
        </p>
        <HistorySection userId={userId} />
      </motion.div>

      {/* ── Acciones ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <button
          onClick={() => navigate("/settings")}
          className="w-full bg-card border border-border rounded-2xl px-5 py-4 flex items-center gap-3 hover:bg-secondary/40 transition-all text-left"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-sans text-foreground">Configuración</span>
        </button>

        {profile.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="w-full bg-primary/10 border border-primary/25 rounded-2xl px-5 py-4 flex items-center gap-3 hover:border-primary/50 transition-all text-left"
          >
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-sans text-foreground font-medium">Portal del Arquitecto</span>
          </button>
        )}

        <button
          onClick={logout}
          className="w-full bg-card border border-border rounded-2xl px-5 py-4 flex items-center gap-3 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all text-left"
        >
          <LogOut className="h-4 w-4 text-rose-400" />
          <span className="text-sm font-sans text-rose-400">Cerrar sesión</span>
        </button>
      </motion.div>

    </div>
  );
}
