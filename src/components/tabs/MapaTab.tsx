import { motion } from "framer-motion";
import { Target, Sparkles, BookOpen, Activity, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CycleChart } from "@/components/CycleChart";
import { NarrativeSection } from "@/components/NarrativeSection";
import { BlueprintIndicator } from "@/components/BlueprintIndicator";

interface MapaTabProps {
  profile: {
    name: string;
    birthDate: string;
    lifePathNumber: number;
    archetype: string;
    description?: string;
    expressionNumber: number;
    soulUrgeNumber: number;
    personalityNumber: number;
    maturityNumber: number;
    narrative?: string;
    powerStrategy?: string;
    shadowWork?: string;
  };
  syncBlueprintIA: () => void;
}

export function MapaTab({ profile, syncBlueprintIA }: MapaTabProps) {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6 pb-6 space-y-5 max-w-lg mx-auto">

      {/* ── Camino de Vida hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em] mb-4">
          Tu Mapa Numérico
        </p>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="font-serif font-bold text-primary tabular-nums" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
              {profile.lifePathNumber}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif font-bold text-2xl text-foreground leading-tight mb-1">
              {profile.archetype}
            </h2>
            {profile.description && (
              <p className="text-xs font-sans text-muted-foreground leading-relaxed line-clamp-3">
                {profile.description}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/onboarding")}
              className="mt-2 h-6 px-2 text-muted-foreground hover:text-primary text-[10px] font-sans gap-1 -ml-2"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Recalcular
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Números del Blueprint ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
          Números de identidad
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Expresión",      value: profile.expressionNumber,  icon: Target },
            { label: "Deseo del Alma", value: profile.soulUrgeNumber,    icon: Sparkles },
            { label: "Personalidad",   value: profile.personalityNumber, icon: BookOpen },
            { label: "Madurez",        value: profile.maturityNumber,    icon: Activity },
          ].map((item, idx) => (
            <BlueprintIndicator key={idx} label={item.label} value={item.value} icon={item.icon} />
          ))}
        </div>
      </motion.div>

      {/* ── Ciclos ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
          Ciclos personales
        </p>
        <CycleChart birthDate={profile.birthDate} />
      </motion.div>

      {/* ── Narrativa IA ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
          Tu lectura maestra
        </p>
        <NarrativeSection
          narrative={profile.narrative}
          powerStrategy={profile.powerStrategy}
          shadowWork={profile.shadowWork}
          archetypeName={profile.archetype}
          onSync={syncBlueprintIA}
        />
      </motion.div>

    </div>
  );
}
