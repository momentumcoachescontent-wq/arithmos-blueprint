import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle, Scale, Sparkles, Calendar, Clock,
  Target, Trophy, Users, FileText,
} from "lucide-react";
import { ProFeatureGate } from "@/components/ProFeatureGate";

interface HerramientasTabProps {
  userId: string;
  hasAccess: boolean;
}

const FREE_TOOLS = [
  { label: "Calendario",       icon: Calendar,       color: "text-primary",    path: "/calendario" },
  { label: "Horas del Día",    icon: Clock,          color: "text-amber-400",  path: "/horas" },
  { label: "Radar de Fricción",icon: Scale,          color: "text-indigo-400", path: "/radar-friccion" },
  { label: "Sincronicidad",    icon: Sparkles,       color: "text-primary",    path: "/synchronicity" },
  { label: "Misiones",         icon: Target,         color: "text-primary",    path: "/missions" },
];

export function HerramientasTab({ userId, hasAccess }: HerramientasTabProps) {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6 pb-6 space-y-6 max-w-lg mx-auto">

      {/* ── Coach — CTA destacado ── */}
      <ProFeatureGate isPremium={hasAccess} userId={userId} featureName="Coach de Sombras" mode="click">
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/coach")}
          className="w-full bg-card border border-primary/25 rounded-2xl p-5 text-left group hover:border-primary/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="font-sans font-semibold text-foreground text-sm">Coach de Sombras</p>
                <p className="text-[10px] font-sans text-muted-foreground">IA · Brave Path Method</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-[10px] text-primary font-bold uppercase tracking-wider">
              Pro
            </span>
          </div>
          <p className="text-xs font-sans text-muted-foreground leading-relaxed">
            Conversaciones honestas para transformar tu patrón de sombra en claridad estratégica.
          </p>
          <p className="text-xs text-primary font-sans font-bold uppercase tracking-wider mt-3 group-hover:underline">
            Iniciar sesión →
          </p>
        </motion.button>
      </ProFeatureGate>

      {/* ── Herramientas gratuitas ── */}
      <div>
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
          Diario y exploración
        </p>
        <div className="grid grid-cols-3 gap-3">
          {FREE_TOOLS.map(({ label, icon: Icon, color, path }, idx) => (
            <motion.button
              key={path}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate(path)}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-border/80 hover:bg-secondary/40 transition-all"
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-[10px] font-sans font-semibold text-foreground/80 text-center leading-tight">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Pro features ── */}
      <div>
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
          Exclusivo Pro
        </p>
        <div className="space-y-3">
          <ProFeatureGate isPremium={hasAccess} userId={userId} featureName="Radar de Equipo" mode="click">
            <button
              onClick={() => navigate("/radar-equipo")}
              className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-left hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-sans font-semibold text-foreground">Radar de Equipo</p>
                    <p className="text-[10px] font-sans text-muted-foreground">Compatibilidad numérica</p>
                  </div>
                </div>
                <span className="text-[10px] text-indigo-400 font-sans font-bold uppercase tracking-wider">Pro →</span>
              </div>
            </button>
          </ProFeatureGate>

          <ProFeatureGate isPremium={hasAccess} userId={userId} featureName="Deep Dive Anual" mode="click">
            <button
              onClick={() => navigate("/deep-dive")}
              className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-left hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-sans font-semibold text-foreground">Deep Dive Anual</p>
                    <p className="text-[10px] font-sans text-muted-foreground">Reporte IA · 15+ páginas</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase tracking-wider">Pro →</span>
              </div>
            </button>
          </ProFeatureGate>
        </div>
      </div>

    </div>
  );
}
