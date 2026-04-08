import { motion } from "framer-motion";
import { Zap, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ARCHETYPE_CONTEXT } from "@/lib/archetypes";

interface ArchetypeCardProps {
  lifePathNumber: number;
  archetypeName: string;
}

export function ArchetypeCard({ lifePathNumber, archetypeName }: ArchetypeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const ctx = ARCHETYPE_CONTEXT[lifePathNumber];

  if (!ctx) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-sans font-semibold text-primary uppercase tracking-wider mb-1">
            Poderes del Arquetipo
          </p>
          <h3 className="font-serif text-lg text-foreground font-semibold">{archetypeName}</h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-serif font-bold text-primary">{lifePathNumber}</span>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {ctx.powers.map((power, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Zap className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
            <span className="text-sm font-sans text-foreground/80 leading-snug capitalize">
              {power}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>Patrón de sombra</span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-border/50"
        >
          <p className="text-xs font-sans text-muted-foreground leading-relaxed">
            {ctx.shadow}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
