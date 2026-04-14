import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Cpu, Save, CheckCircle2, AlertCircle, Loader2, RotateCcw, Brain, Activity, Target, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAITokenStats } from "@/hooks/useAITokenStats";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from "recharts";

// Bypass Supabase generated types for tables not yet reflected in schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const AI_MODELS = [
    // Anthropic — Claude
    { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", badge: "🎯 Recomendado", provider: "Anthropic" },
    { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 — Rápido y económico", badge: "⚡ Económico", provider: "Anthropic" },
    { value: "claude-opus-4-6", label: "Claude Opus 4.6 — Máxima capacidad", badge: "🧠 Máximo", provider: "Anthropic" },
    // OpenAI — GPT (fallback si Anthropic sin créditos)
    { value: "gpt-4o-mini", label: "GPT-4o Mini — Rápido y económico", badge: "⚡ Fallback", provider: "OpenAI" },
    { value: "gpt-4o", label: "GPT-4o — Máxima inteligencia OpenAI", badge: "🧠 Fallback", provider: "OpenAI" },
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
    friction_radar: "🛡️ Radar de Fricción (Diagnóstico de Sombras)",
};

export function AdminAITab() {
    const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
    const [activeFeature, setActiveFeature] = useState("coach_chat");
    const [editedContent, setEditedContent] = useState("");
    const [editedModel, setEditedModel] = useState("gpt-4o-mini");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);
    const [connTest, setConnTest] = useState<{ status: "idle" | "testing" | "ok" | "err"; message: string }>({ status: "idle", message: "" });

    // AI Stats Hook
    const { summary, trendData, topUsers, isLoading: isLoadingStats, fetchStats } = useAITokenStats();

    const fetchPrompts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await db
                .from("system_prompts")
                .select("feature, content, model_id")
                .order("feature");

            if (error) throw error;

            const mapped: SystemPrompt[] = (data || []).map((p: any) => ({
                feature: p.feature,
                content: p.content || "",
                model_id: p.model_id || "gpt-4o-mini",
                label: FEATURE_LABELS[p.feature] || p.feature,
            }));

            setPrompts(mapped);

            // Set initial edit state based on current or first found
            const current = mapped.find(p => p.feature === activeFeature) || mapped[0];
            if (current) {
                // IMPORTANT: Only set activeFeature if it was different to ensure UI stays in sync
                if (activeFeature !== current.feature) {
                    setActiveFeature(current.feature);
                }
                setEditedContent(current.content);
                setEditedModel(current.model_id);
            }
        } catch (err) {
            console.error("AdminAITab — Error fetching prompts:", err);
            setStatus({ message: "Error al cargar prompts. Asegúrate de que la tabla exista en Supabase.", type: "err" });
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency to fetch only on mount or manual refresh

    useEffect(() => {
        fetchPrompts();
        fetchStats(30); // Cargar últimos 30 días de métricas al montar
    }, [fetchPrompts, fetchStats]);

    const handleFeatureChange = (feature: string) => {
        setActiveFeature(feature);
        const found = prompts.find((p) => p.feature === feature);
        if (found) {
            setEditedContent(found.content || "");
            setEditedModel(found.model_id || "gpt-4o-mini");
        }
    };

    const handleSave = async () => {
        if (!activeFeature) return;

        setIsSaving(true);
        setStatus(null);
        try {
            const { error } = await db
                .from("system_prompts")
                .upsert({
                    feature: activeFeature,
                    content: editedContent,
                    model_id: editedModel,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'feature' });

            if (error) throw error;

            // Update local memory list
            setPrompts(prev => prev.map(p =>
                p.feature === activeFeature
                    ? { ...p, content: editedContent, model_id: editedModel }
                    : p
            ));

            setStatus({
                message: "Cambios guardados. El bot aplicará esta nueva personalidad inmediatamente.",
                type: "ok"
            });
            setTimeout(() => setStatus(null), 5000);
        } catch (err: any) {
            console.error("Error saving prompt:", err);
            setStatus({
                message: `Error al guardar: ${err.message || "Verifica permisos RLS"}`,
                type: "err"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        const found = prompts.find((p) => p.feature === activeFeature);
        if (found) {
            setEditedContent(found.content || "");
            setEditedModel(found.model_id || "claude-sonnet-4-6");
        }
    };

    const handleTestConnection = async () => {
        setConnTest({ status: "testing", message: "Enviando ping a Claude..." });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = await import("@/integrations/supabase/client");
            const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-coach`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token || SUPABASE_PUBLISHABLE_KEY}`,
                    "apikey": SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                    action: "chat",
                    messages: [{ role: "user", content: "ping" }],
                    context: { name: "Admin", lifePathNumber: 1, archetype: "El Pionero", archetypePowers: [], archetypeShadow: "", archetypeCoachingNote: "" },
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({})) as { error?: string };
                setConnTest({ status: "err", message: `Error ${res.status}: ${err.error || "respuesta inválida"}` });
                return;
            }

            const reader = res.body?.getReader();
            if (!reader) { setConnTest({ status: "err", message: "No se pudo leer el stream" }); return; }

            const decoder = new TextDecoder();
            let reply = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                reply += decoder.decode(value, { stream: true });
                if (reply.length > 0) break; // basta con el primer chunk
            }
            reader.cancel();

            if (reply.trim()) {
                setConnTest({ status: "ok", message: `Conectado. Modelo activo responde correctamente.` });
            } else {
                setConnTest({ status: "err", message: "Stream vacío — verifica ANTHROPIC_API_KEY en Supabase Secrets" });
            }
        } catch (e: unknown) {
            setConnTest({ status: "err", message: (e as Error).message || "Error de red" });
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

    // Improved change detection logic
    const normalizedEditedContent = (editedContent || "").trim();
    const normalizedSavedContent = (activePrompt?.content || "").trim();
    const normalizedEditedModel = editedModel || "gpt-4o-mini";
    const normalizedSavedModel = activePrompt?.model_id || "gpt-4o-mini";

    const hasChanges = activePrompt && (
        normalizedEditedContent !== normalizedSavedContent ||
        normalizedEditedModel !== normalizedSavedModel
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2 mb-1">
                    <Brain className="h-6 w-6 text-primary" />
                    IA & Configuración
                </h2>
                <p className="text-muted-foreground font-sans text-sm">
                    Configura modelos Claude y los System Prompts base. El Coach AI usa un prompt dinámico por arquetipo — edita el tono y las reglas aquí.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Feature Selector */}
                <div className="lg:col-span-1 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-3">Bot / Función</p>
                    {prompts.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-border bg-secondary/20">
                            <p className="text-sm text-muted-foreground font-sans italic text-center">
                                No hay prompts configurados.
                            </p>
                        </div>
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
                    {!activePrompt ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground font-sans">Selecciona un bot para editar su personalidad.</p>
                        </div>
                    ) : (
                        <>
                            {/* Model Selector */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground font-sans flex items-center gap-1.5">
                                    <Cpu className="h-3.5 w-3.5" /> Modelo Claude (referencia)
                                </Label>
                                {["Anthropic", "OpenAI"].map((provider) => (
                                    <div key={provider} className="mb-3">
                                        <p className="text-[10px] uppercase tracking-widest font-sans font-bold text-muted-foreground mb-2 px-1">
                                            {provider === "OpenAI" ? "⚠️ OpenAI (fallback si Anthropic sin créditos)" : "✦ " + provider}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {AI_MODELS.filter(m => m.provider === provider).map((m) => (
                                                <button
                                                    key={m.value}
                                                    onClick={() => setEditedModel(m.value)}
                                                    className={`text-left p-3 rounded-xl border transition-all ${editedModel === m.value
                                                        ? provider === "OpenAI"
                                                            ? "border-amber-500/50 bg-amber-500/10"
                                                            : "border-primary bg-primary/10"
                                                        : "border-border bg-secondary/30 hover:border-primary/40"
                                                        }`}
                                                >
                                                    <div className={`text-xs font-bold font-sans mb-1 ${provider === "OpenAI" ? "text-amber-400" : "text-primary"}`}>{m.badge}</div>
                                                    <div className="text-xs font-sans text-foreground leading-snug">{m.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Prompt Content */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground font-sans">System Prompt (Personalidad)</Label>
                                <Textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    rows={14}
                                    className="font-mono text-xs resize-none leading-relaxed focus:ring-primary/20"
                                    placeholder="Escribe aquí la personalidad del bot..."
                                />
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                                    <span>{editedContent.length} caracteres</span>
                                    <span>Real-time update enabled</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving || !hasChanges}
                                        className="gap-2 min-w-[140px]"
                                    >
                                        {isSaving ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</>
                                        ) : (
                                            <><Save className="h-4 w-4" />Grabar Personalidad</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleReset}
                                        disabled={!hasChanges}
                                        className="gap-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Revertir
                                    </Button>
                                </div>

                                {status && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`flex items-center gap-2 text-xs font-sans px-3 py-1.5 rounded-full ${status.type === "ok"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}
                                    >
                                        {status.type === "ok" ? (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        ) : (
                                            <AlertCircle className="h-3.5 w-3.5" />
                                        )}
                                        {status.message}
                                    </motion.div>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* TEST DE CONEXIÓN */}
            <div className="glass rounded-2xl p-5 border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-sans font-bold text-foreground flex items-center gap-2">
                        {connTest.status === "ok" ? <Wifi className="h-4 w-4 text-emerald-400" /> :
                         connTest.status === "err" ? <WifiOff className="h-4 w-4 text-rose-400" /> :
                         <Wifi className="h-4 w-4 text-muted-foreground" />}
                        Test de Conexión Claude
                    </p>
                    <p className="text-xs text-muted-foreground font-sans mt-0.5">
                        {connTest.status === "idle" ? "Verifica que el modelo activo responde correctamente." : connTest.message}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={connTest.status === "testing"}
                    className={`flex-shrink-0 gap-2 text-xs ${
                        connTest.status === "ok" ? "border-emerald-500/30 text-emerald-400" :
                        connTest.status === "err" ? "border-rose-500/30 text-rose-400" : ""
                    }`}
                >
                    {connTest.status === "testing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                     connTest.status === "ok" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     connTest.status === "err" ? <AlertCircle className="h-3.5 w-3.5" /> :
                     <Wifi className="h-3.5 w-3.5" />}
                    {connTest.status === "testing" ? "Probando..." :
                     connTest.status === "ok" ? "Reconectar" :
                     connTest.status === "err" ? "Reintentar" : "Probar conexión"}
                </Button>
            </div>

            {/* SECCIÓN NUEVA: MÉTRICAS DE CONSUMO Y COSTOS IA */}
            <div className="mt-12 space-y-6">
                <div>
                    <h3 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2 mb-1">
                        <Activity className="h-5 w-5 text-emerald-400" />
                        FinOps: Costo del Intelecto Sintético
                    </h3>
                    <p className="text-muted-foreground font-sans text-sm">
                        Auditoría del consumo de tokens a través de los diversos bots del ecosistema (Últimos 30 días).
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Costo Acumulado KPI */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-xl p-6 border-border flex flex-col justify-center"
                    >
                        <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                           <Target className="h-4 w-4 text-emerald-500" />
                           Total Gastado
                        </p>
                        {isLoadingStats ? (
                            <div className="h-10 w-24 bg-secondary/50 rounded animate-pulse" />
                        ) : (
                            <>
                                <p className="text-4xl font-serif font-bold text-foreground">
                                    ${summary.totalCostUSD.toFixed(3)} <span className="text-sm text-muted-foreground font-sans">USD</span>
                                </p>
                                <p className="text-sm font-sans text-muted-foreground mt-2">
                                    {summary.totalPromptTokens + summary.totalCompletionTokens} Tokens Totales
                                </p>
                            </>
                        )}
                    </motion.div>

                    {/* Prompts vs Completions */}
                    <div className="lg:col-span-3 glass rounded-xl p-6 border-border flex gap-8 items-center bg-secondary/10">
                        {isLoadingStats ? (
                            <div className="w-full h-16 bg-secondary/30 rounded animate-pulse" />
                        ) : (
                            <>
                                <div className="flex-1 space-y-2">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans">Prompt Tokens (Escuchado)</p>
                                    <p className="text-2xl font-serif font-bold text-sky-400">{summary.totalPromptTokens}</p>
                                </div>
                                <div className="w-px h-12 bg-border"></div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans">Completion Tokens (Hablado)</p>
                                    <p className="text-2xl font-serif font-bold text-violet-400">{summary.totalCompletionTokens}</p>
                                </div>
                                <div className="w-px h-12 bg-border"></div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans">Función Dominante</p>
                                    <p className="text-lg font-serif font-bold text-amber-400 capitalize">
                                        {summary.topFeature ? summary.topFeature.name.replace('_', ' ') : 'N/A'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Tendencia */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass rounded-2xl p-6 border-border"
                    >
                        <h4 className="text-sm font-sans font-bold text-foreground mb-6">Tendencia de Costo Operativo (USD)</h4>
                        {isLoadingStats ? (
                            <div className="w-full h-[250px] bg-secondary/20 rounded-xl animate-pulse" />
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff', marginBottom: '8px' }}
                                        itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" name="Costo (USD)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>

                    {/* Ranking Superusuarios */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 glass rounded-2xl p-6 border-border flex flex-col"
                    >
                        <h4 className="text-sm font-sans font-bold text-foreground mb-6">Top 10 Creyentes (Consumo)</h4>
                        {isLoadingStats ? (
                             <div className="w-full h-full bg-secondary/20 rounded-xl animate-pulse" />
                        ) : topUsers.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-border rounded-xl">
                                <p className="text-xs text-muted-foreground font-sans italic text-center">Sin consumo registrado aún</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {topUsers.map((user, idx) => (
                                    <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                                {idx + 1}
                                            </div>
                                            <p className="text-xs font-sans text-foreground truncate">{user.name}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-bold text-emerald-400">${user.total_cost.toFixed(3)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
