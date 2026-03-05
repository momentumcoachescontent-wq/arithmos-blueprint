import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Cpu, Save, CheckCircle2, AlertCircle, Loader2, RotateCcw, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

// Bypass Supabase generated types for tables not yet reflected in schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const AI_MODELS = [
    { value: "gpt-4o-mini", label: "GPT-4o Mini — Rápido y económico (recomendado)", badge: "⚡ Default" },
    { value: "gpt-4o", label: "GPT-4o — Máxima inteligencia conversacional", badge: "🧠 Premium" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo — Balance potencia/costo", badge: "⚖️ Balance" },
];

interface SystemPrompt {
    feature: string;
    content: string;
    model_id: string;
    label: string;
}

const FEATURE_LABELS: Record<string, string> = {
    coach_chat: "🎭 Coach AI Principal (Conversaciones y Sesiones)",
    scanner: "🔍 Scanner Numérico (Análisis de Equipos)",
    daily_pulse: "📡 Daily Pulse (Lectura del Día)",
};

export function AdminAITab() {
    const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
    const [activeFeature, setActiveFeature] = useState("coach_chat");
    const [editedContent, setEditedContent] = useState("");
    const [editedModel, setEditedModel] = useState("gpt-4o-mini");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);

    const fetchPrompts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await db
                .from("system_prompts")
                .select("feature, content, model_id")
                .order("feature");
            if (error) throw error;
            const mapped: SystemPrompt[] = (data || []).map((p: Record<string, string>) => ({
                feature: p.feature,
                content: p.content,
                model_id: p.model_id || "gpt-4o-mini",
                label: FEATURE_LABELS[p.feature] || p.feature,
            }));
            setPrompts(mapped);
            const first = mapped.find((p) => p.feature === activeFeature) || mapped[0];
            if (first) {
                setEditedContent(first.content || "");
                setEditedModel(first.model_id || "gpt-4o-mini");
            }
        } catch (err) {
            console.error("AdminAITab — Error fetching prompts:", err);
        } finally {
            setIsLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

    const handleFeatureChange = (feature: string) => {
        setActiveFeature(feature);
        const found = prompts.find((p) => p.feature === feature);
        if (found) {
            setEditedContent(found.content || "");
            setEditedModel(found.model_id || "gpt-4o-mini");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatus(null);
        try {
            const { error } = await db
                .from("system_prompts")
                .update({ content: editedContent, model_id: editedModel, updated_at: new Date().toISOString() })
                .eq("feature", activeFeature);
            if (error) throw error;
            setPrompts((prev) =>
                prev.map((p) => p.feature === activeFeature
                    ? { ...p, content: editedContent, model_id: editedModel }
                    : p
                )
            );
            setStatus({ message: "Prompt y modelo actualizados. Las Edge Functions usarán esta configuración en tiempo real.", type: "ok" });
            setTimeout(() => setStatus(null), 5000);
        } catch {
            setStatus({ message: "Error al guardar. Verifica los permisos RLS en Supabase.", type: "err" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        const found = prompts.find((p) => p.feature === activeFeature);
        if (found) {
            setEditedContent(found.content || "");
            setEditedModel(found.model_id || "gpt-4o-mini");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-16 text-muted-foreground animate-pulse font-sans">
                Cargando configuración de IA...
            </div>
        );
    }

    const activePrompt = prompts.find((p) => p.feature === activeFeature);
    const hasChanges = activePrompt &&
        (editedContent !== activePrompt.content || editedModel !== activePrompt.model_id);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2 mb-1">
                    <Brain className="h-6 w-6 text-primary" />
                    IA & Configuración
                </h2>
                <p className="text-muted-foreground font-sans text-sm">
                    Configura el modelo de OpenAI y los System Prompts que moldean la personalidad de cada bot. Los cambios se aplican inmediatamente.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Feature Selector */}
                <div className="lg:col-span-1 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-3">Bot / Función</p>
                    {prompts.length === 0 ? (
                        <p className="text-sm text-muted-foreground font-sans italic">
                            No hay prompts configurados en la base de datos.
                        </p>
                    ) : (
                        prompts.map((p) => (
                            <button
                                key={p.feature}
                                onClick={() => handleFeatureChange(p.feature)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-sans transition-all border ${activeFeature === p.feature
                                        ? "bg-primary/10 border-primary/30 text-foreground font-semibold"
                                        : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))
                    )}
                </div>

                {/* Prompt Editor */}
                <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3 glass rounded-2xl p-6 border-border space-y-5"
                >
                    {/* Model Selector */}
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground font-sans flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5" /> Modelo de OpenAI
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {AI_MODELS.map((m) => (
                                <button
                                    key={m.value}
                                    onClick={() => setEditedModel(m.value)}
                                    className={`text-left p-4 rounded-xl border transition-all ${editedModel === m.value
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-secondary/30 hover:border-primary/40"
                                        }`}
                                >
                                    <div className="text-xs font-bold font-sans text-primary mb-1">{m.badge}</div>
                                    <div className="text-xs font-sans text-foreground leading-snug">{m.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prompt Content */}
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground font-sans">System Prompt (Personalidad del Bot)</Label>
                        <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={14}
                            className="font-mono text-xs resize-none leading-relaxed"
                            placeholder="Eres un coach de psicología aplicada especializado en..."
                        />
                        <p className="text-xs text-muted-foreground font-sans">
                            {editedContent.length} caracteres · Las Edge Functions leen este valor en cada llamada.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="gap-2">
                            {isSaving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</>
                            ) : (
                                <><Save className="h-4 w-4" />Guardar Cambios</>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            disabled={!hasChanges}
                            className="gap-2 text-muted-foreground"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Revertir
                        </Button>
                    </div>

                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-2 text-sm font-sans px-4 py-2 rounded-lg ${status.type === "ok"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                        >
                            {status.type === "ok" ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            {status.message}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
