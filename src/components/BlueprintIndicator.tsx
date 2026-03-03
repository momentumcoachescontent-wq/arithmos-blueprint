import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "./ui/tooltip";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlueprintIndicatorProps {
    label: string;
    value: number | undefined | null;
    icon: LucideIcon;
    className?: string;
}

const INDICATOR_DEFINITIONS: Record<string, string> = {
    "Expresión": "Representa tus talentos naturales, capacidades y la forma en que interactúas con el mundo. Es el 'cómo' manifiestas tu propósito.",
    "Deseo Alma": "Revela tus anhelos más profundos, lo que realmente motiva tu corazón y lo que necesitas para sentirte pleno internamente.",
    "Personalidad": "La imagen que proyectas hacia los demás, la primera impresión que causas y tu escudo social o 'máscara' externa.",
    "Madurez": "El desafío y la recompensa que se manifiesta en la madurez, integrando tus talentos con tu misión de vida.",
};

const NUMBER_MEANINGS: Record<number, string> = {
    1: "Liderazgo, independencia, iniciativa y originalidad.",
    2: "Diplomacia, cooperación, sensibilidad y equilibrio.",
    3: "Expresión creativa, comunicación, optimismo y alegría.",
    4: "Estructura, disciplina, trabajo duro y estabilidad.",
    5: "Libertad, aventura, cambio rápido y versatilidad.",
    6: "Armonía, responsabilidad, amor familiar y servicio.",
    7: "Sabiduría, introspección, análisis y profundidad espiritual.",
    8: "Poder, éxito material, autoridad y juicio eficiente.",
    9: "Humanismo, compasión, idealismo y cierres de ciclo.",
    11: "Iluminación, intuición elevada y carisma visionario.",
    22: "Maestro Constructor, manifestando sueños en la realidad física.",
    33: "Guía Espiritual, amor incondicional y protección altruista.",
};

export function BlueprintIndicator({ label, value, icon: Icon, className }: BlueprintIndicatorProps) {
    const definition = INDICATOR_DEFINITIONS[label] || "";
    const meaning = value ? NUMBER_MEANINGS[value as number] : "";

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "glass rounded-xl p-4 text-center border-border hover:border-primary/40 transition-all cursor-help group relative overflow-hidden",
                        className
                    )}>
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex justify-center mb-1">
                                <Icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-sans font-medium group-hover:text-foreground transition-colors">
                                {label}
                            </p>
                            <p className="text-2xl font-serif font-bold text-foreground">
                                {value || "?"}
                            </p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="max-w-[200px] font-sans p-3 glass border-border/50 text-xs leading-relaxed"
                >
                    <div className="space-y-2">
                        <div>
                            <p className="font-bold text-primary mb-0.5">{label}</p>
                            <p className="text-muted-foreground">{definition}</p>
                        </div>
                        {value && meaning && (
                            <div className="pt-2 border-t border-border/30">
                                <p className="font-bold text-foreground mb-0.5">Vibración {value}</p>
                                <p className="text-muted-foreground italic">"{meaning}"</p>
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
