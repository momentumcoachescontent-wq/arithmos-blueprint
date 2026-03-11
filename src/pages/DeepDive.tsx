import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    FileText, ArrowLeft, Sparkles, Download, Star,
    Calendar, Layers, Target, TrendingUp, Shield, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Secciones del Deep Dive — informativas
const DEEP_DIVE_SECTIONS = [
    { icon: Calendar, title: "Ciclos Anuales 2025–2026", description: "Mapa completo de tus ciclos personales y universales para los próximos 12 meses." },
    { icon: Star, title: "Análisis de Números Maestros", description: "Camino de Vida, Expresión, Impulso del Alma y Personalidad integrados en un perfil estratégico." },
    { icon: Target, title: "Misión de Vida & Karma", description: "Número Kármico, lecciones del alma y el propósito superior que tu nacimiento codificó." },
    { icon: TrendingUp, title: "Ventanas de Oportunidad", description: "Los meses de mayor potencia y los períodos para descanso y consolidación estratégica." },
    { icon: Layers, title: "Arquitectura de Decisiones", description: "Marco numerológico para tomar decisiones de negocio, relaciones y pivotes de carrera." },
    { icon: Shield, title: "Mapa de Sombras y Recursos", description: "Los patrones inconscientes que te frenan y las fortalezas latentes que aún no activas." },
];

const LOADING_MESSAGES = [
    "Invocando tu frecuencia numerológica...",
    "Integrando los 5 números de tu arquitectura...",
    "Analizando tu Año Personal con IA...",
    "Construyendo el mapa de sombras y recursos...",
    "Calculando ventanas de oportunidad del año...",
    "Finalizando tu Deep Dive en 15+ páginas...",
];

const DeepDive = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile } = useProfile();
    const { redirectToCheckout, isLoading: isLoadingCheckout } = useSubscription(user?.id);
    const [isRequestingReport, setIsRequestingReport] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [reportRequested, setReportRequested] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [hasRecentReport, setHasRecentReport] = useState(false);
    const [isCheckingReport, setIsCheckingReport] = useState(true);

    useEffect(() => {
        const checkRecentReport = async () => {
            if (!user) {
                setIsCheckingReport(false);
                return;
            }
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const { data } = await supabase
                .from("readings")
                .select("metadata")
                .eq("user_id", user.id)
                .eq("type", "deep_dive_pdf")
                .gte("created_at", sixMonthsAgo.toISOString())
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if ((data?.metadata as any)?.file_name) {
                setHasRecentReport(true);
            }
            setIsCheckingReport(false);
        };
        checkRecentReport();
    }, [user]);

    const handleRequestReport = async () => {
        if (!user) return;
        setIsRequestingReport(true);
        setLoadingMessage(LOADING_MESSAGES[0]);

        // Rotar mensajes de carga para dar feedback al usuario
        let msgIdx = 0;
        let msgInterval: number | undefined;

        if (!hasRecentReport) {
            msgInterval = window.setInterval(() => {
                msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
                setLoadingMessage(LOADING_MESSAGES[msgIdx]);
            }, 5000);
        } else {
            setLoadingMessage("Recuperando tu reporte almacenado...");
        }

        try {
            // Obtener el JWT de sesión del usuario explícitamente
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Sesión expirada", { description: "Por favor, inicia sesión de nuevo." });
                setIsRequestingReport(false);
                clearInterval(msgInterval);
                return;
            }

            const { data, error } = await supabase.functions.invoke("generate-deep-dive-pdf", {
                body: {},
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (msgInterval) window.clearInterval(msgInterval);

            if (error) throw new Error(error.message || "Error generando el reporte");

            // Caso 1: URL firmada de Storage (path normal)
            if (data?.url) {
                window.open(data.url, "_blank");
                setDownloadUrl(data.url);
                setReportRequested(true);
                toast.success("¡Reporte generado!", {
                    description: "Tu Deep Dive Anual se ha abierto en una nueva pestaña. Usa Ctrl+P → Guardar como PDF.",
                    duration: 8000,
                });
                // Caso 2: HTML directo (fallback sin Storage)
            } else if (data?.html) {
                const blob = new Blob([data.html], { type: "text/html;charset=utf-8" });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");
                setDownloadUrl(blobUrl);
                setReportRequested(true);
                // Limpiar el blob URL después de 5 minutos
                setTimeout(() => URL.revokeObjectURL(blobUrl), 300000);
                toast.success("¡Reporte generado!", {
                    description: "Tu Deep Dive Anual se ha abierto en una nueva pestaña. Usa Ctrl+P → Guardar como PDF.",
                    duration: 8000,
                });
            } else {
                throw new Error("No se recibió el contenido del reporte");
            }
        } catch (err: any) {
            if (msgInterval) window.clearInterval(msgInterval);
            console.error("Error solicitando Deep Dive:", err);
            toast.error("Error generando el reporte", {
                description: err.message || "Inténtalo nuevamente en unos minutos.",
            });
        } finally {
            setIsRequestingReport(false);
        }
    };

    if (!profile) return null;

    const isPremium = profile.role === "premium" || profile.role === "admin";

    return (
        <div className="min-h-screen bg-background px-6 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-sans font-bold uppercase tracking-widest border border-emerald-500/20">
                        <FileText className="h-3 w-3" /> Deep Dive Pro
                    </div>
                </div>

                <ProFeatureGate userRole={profile.role} userId={user?.id || ""} featureName="Reporte Deep Dive Anual">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        {/* Hero */}
                        <div>
                            <h1 className="text-4xl font-serif font-semibold text-gradient-silver mb-3">
                                Reporte Deep Dive Anual
                            </h1>
                            <p className="text-muted-foreground font-sans leading-relaxed">
                                Tu hoja de ruta estratégica para los próximos 12 meses, generada por IA en un documento de 15+ páginas.
                                Incluye análisis profundo de ciclos numerológicos, ventanas de oportunidad y estrategias de manifestación.
                            </p>
                        </div>

                        {/* Secciones del reporte */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DEEP_DIVE_SECTIONS.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="glass rounded-xl p-5 border-border hover:border-emerald-500/20 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 mt-0.5">
                                            <section.icon className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-serif font-semibold text-foreground mb-1">{section.title}</h3>
                                            <p className="text-xs text-muted-foreground font-sans leading-relaxed">{section.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA / Estado del reporte */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="glass rounded-2xl p-8 border-emerald-500/20 bg-emerald-500/5 text-center"
                        >
                            {isRequestingReport ? (
                                /* Estado: Generando */
                                <div className="space-y-6 py-4">
                                    <div className="relative w-20 h-20 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                                            Arithmos está trabajando...
                                        </h3>
                                        <motion.p
                                            key={loadingMessage}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-emerald-400 font-sans italic"
                                        >
                                            {loadingMessage}
                                        </motion.p>
                                    </div>
                                    <p className="text-xs text-muted-foreground/60 font-sans">
                                        La IA está analizando tu perfil completo. Esto puede tomar 20–40 segundos.
                                    </p>
                                </div>
                            ) : reportRequested ? (
                                /* Estado: Completado */
                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                                        <Download className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-serif font-semibold text-foreground">¡Reporte Generado!</h3>
                                    <p className="text-muted-foreground font-sans text-sm max-w-sm mx-auto">
                                        Tu Deep Dive Anual se ha abierto en una nueva pestaña.
                                        Usa <strong className="text-foreground">Ctrl+P → Guardar como PDF</strong> para conservarlo.
                                    </p>
                                    <div className="flex gap-3 justify-center flex-wrap">
                                        {downloadUrl && (
                                            <Button
                                                onClick={() => window.open(downloadUrl, "_blank")}
                                                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none"
                                            >
                                                <Download className="h-4 w-4" />
                                                Abrir Reporte de Nuevo
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            disabled={hasRecentReport}
                                            onClick={() => { setReportRequested(false); setDownloadUrl(null); }}
                                            className="text-sm"
                                        >
                                            Generar Nuevo Reporte {hasRecentReport && "(Disponible en 6 meses)"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Estado: Inicial */
                                <div className="space-y-4">
                                    <Sparkles className="h-10 w-10 text-emerald-400 mx-auto" />
                                    <h3 className="text-xl font-serif font-semibold text-foreground">Todo listo para tu análisis</h3>
                                    <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">
                                        Como usuario Premium, tienes acceso a tu reporte anual generado por IA.
                                        El perfil de <strong className="text-foreground">{profile.name}</strong> será analizado en profundidad: 15+ páginas de estrategia numerológica.
                                    </p>
                                    <Button
                                        onClick={handleRequestReport}
                                        disabled={isRequestingReport || isCheckingReport}
                                        className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none px-8"
                                    >
                                        <FileText className="h-4 w-4" />
                                        {hasRecentReport ? "Descargar Reporte Existente" : "Solicitar Mi Reporte Anual"}
                                    </Button>
                                    <p className="text-xs text-muted-foreground/60">
                                        {hasRecentReport
                                            ? "Generado recientemente. Opción de re-generar disponible cada 6 meses."
                                            : "Incluido en tu plan Premium · Procesamiento: ~30 segundos"}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </ProFeatureGate>
            </div>
        </div>
    );
};

export default DeepDive;
