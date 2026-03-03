import React, { useState } from "react";
import { Sparkles, Heart, DollarSign, ShieldCheck, User, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface GrabovoiMantraWidgetProps {
    birthDate: string;
}

const CATEGORIES = [
    { id: "health", label: "Salud y Curación Física", icon: Heart, baseCode: "1814321" },
    { id: "spiritual", label: "Bienestar Mental y Espiritual", icon: Sparkles, baseCode: "71427321893" },
    { id: "finance", label: "Prosperidad y Finanzas", icon: DollarSign, baseCode: "318798" },
    { id: "protection", label: "Situaciones de Vida y Protección", icon: ShieldCheck, baseCode: "71931" },
    { id: "personal", label: "Desarrollo Personal", icon: User, baseCode: "191317481901" },
];

export function GrabovoiMantraWidget({ birthDate }: GrabovoiMantraWidgetProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [mantra, setMantra] = useState<{ code: string; label: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateMantra = (categoryId: string) => {
        setIsGenerating(true);
        setSelectedCategory(categoryId);

        // Simular cálculo personalizado
        setTimeout(() => {
            const category = CATEGORIES.find(c => c.id === categoryId);
            if (!category) return;

            const today = new Date();
            const bDate = new Date(birthDate);

            // Semilla de personalización basada en fecha nacimiento y hoy
            const seed = (bDate.getDate() + today.getDate()) % 9 || 9;
            const personalizedSuffix = seed.toString().repeat(3);

            setMantra({
                code: `${category.baseCode} ${personalizedSuffix}`,
                label: category.label
            });
            setIsGenerating(false);
        }, 800);
    };

    return (
        <div className="glass rounded-2xl p-6 border-border/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-12 w-12 text-primary" />
            </div>

            <div className="relative z-10 mb-6">
                <h3 className="text-lg font-serif font-bold text-foreground mb-1">
                    Frecuencia de Enfoque <span className="text-primary italic">Grabovoi</span>
                </h3>
                <p className="text-xs text-muted-foreground font-sans mb-3">
                    Selecciona tu intención para sintonizar tu código de manifestación personal de hoy.
                </p>
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                        Para usar correctamente los códigos de Grabovoi debemos tener una mente abierta. Ningún método de manifestación sirve si no creemos que se puede lograr. Una vez que hayamos determinado los dígitos, debemos concentrarnos y visualizarlos, repitiéndolos en voz baja, dígito por dígito.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => generateMantra(cat.id)}
                            disabled={isGenerating}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center group/btn",
                                isSelected
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-card/50 border-border/60 hover:border-primary/40 hover:bg-card text-muted-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 transition-transform group-hover/btn:scale-110",
                                isSelected ? "text-primary" : "text-muted-foreground group-hover/btn:text-primary/70"
                            )} />
                            <span className="text-[10px] font-sans font-medium leading-tight">
                                {cat.label.split(' y ')[0]}
                            </span>
                        </button>
                    )
                })}
            </div>

            <AnimatePresence mode="wait">
                {mantra ? (
                    <motion.div
                        key="mantra"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center"
                    >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-2 font-sans font-bold">
                            Tu Código de Enfoque para {mantra.label}
                        </p>
                        <p className="text-3xl font-serif font-black text-primary tracking-widest mb-3">
                            {mantra.code}
                        </p>
                        <p className="text-xs text-muted-foreground italic font-sans max-w-sm mx-auto">
                            "Enfoca tu mente en estos números mientras visualizas tu intención ya manifestada en la realidad."
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setMantra(null); setSelectedCategory(null); }}
                            className="mt-4 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary h-8"
                        >
                            Nueva Intención <RefreshCcw className="ml-2 h-3 w-3" />
                        </Button>
                    </motion.div>
                ) : isGenerating ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 text-primary animate-pulse">
                        <RefreshCcw className="h-8 w-8 animate-spin" />
                        <span className="text-xs font-sans font-bold uppercase tracking-widest">Sintonizando Frecuencia...</span>
                    </div>
                ) : (
                    <div className="py-8 border border-dashed border-border/60 rounded-xl text-center bg-card/20">
                        <p className="text-sm font-sans text-muted-foreground italic">
                            Elige una categoría superior para generar tu mantra numérico.
                        </p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
