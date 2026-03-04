import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    FileText, ArrowLeft, Sparkles, Download, Star,
    Calendar, Layers, Target, TrendingUp, Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

// Secciones del Deep Dive — informativas (el PDF real requiere n8n/IA en el backend)
const DEEP_DIVE_SECTIONS = [
    { icon: Calendar, title: "Ciclos Anuales 2025–2026", description: "Mapa completo de tus ciclos personales y universales para los próximos 12 meses." },
    { icon: Star, title: "Análisis de Números Maestros", description: "Camino de Vida, Expresión, Impulso del Alma y Personalidad integrados en un perfil estratégico." },
    { icon: Target, title: "Misión de Vida & Karma", description: "Número Kármico, lecciones del alma y el propósito superior que tu nacimiento codificó." },
    { icon: TrendingUp, title: "Ventanas de Oportunidad", description: "Los meses de mayor potencia y los períodos para descanso y consolidación estratégica." },
    { icon: Layers, title: "Arquitectura de Decisiones", description: "Marco numerológico para tomar decisiones de negocio, relaciones y pivotes de carrera." },
    { icon: Shield, title: "Mapa de Sombras y Recursos", description: "Los patrones inconscientes que te frenan y las fortalezas latentes que aún no activas." },
];

const DeepDive = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile } = useProfile();
    const { redirectToCheckout, isLoading: isLoadingCheckout } = useSubscription(user?.id);
    const [isRequestingReport, setIsRequestingReport] = useState(false);
    const [reportRequested, setReportRequested] = useState(false);

    const handleRequestReport = async () => {
        setIsRequestingReport(true);
        // Simula el disparo del flujo n8n que generará el PDF
        // En producción: supabase.functions.invoke("generate-deep-dive-pdf", { body: { userId: user?.id } })
        await new Promise(r => setTimeout(r, 1500));
        setReportRequested(true);
        setIsRequestingReport(false);
        toast.success("¡Reporte solicitado!", {
            description: "Recibirás tu Deep Dive Anual en los próximos 15 minutos por email.",
        });
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
                            {reportRequested ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                                        <Download className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-serif font-semibold text-foreground">¡Reporte en Proceso!</h3>
                                    <p className="text-muted-foreground font-sans text-sm">
                                        Nuestro sistema de IA está generando tu Deep Dive personalizado.
                                        Lo recibirás en tu email en los próximos 15 minutos.
                                    </p>
                                    <Button variant="outline" onClick={() => setReportRequested(false)} className="text-sm">
                                        Solicitar otro reporte
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Sparkles className="h-10 w-10 text-emerald-400 mx-auto" />
                                    <h3 className="text-xl font-serif font-semibold text-foreground">Todo listo para tu análisis</h3>
                                    <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">
                                        Como usuario Premium, tienes acceso completo a tu reporte anual. El perfil de{" "}
                                        <strong className="text-foreground">{profile.name}</strong> será analizado en profundidad.
                                    </p>
                                    <Button
                                        onClick={handleRequestReport}
                                        disabled={isRequestingReport}
                                        className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none px-8"
                                    >
                                        <FileText className="h-4 w-4" />
                                        {isRequestingReport ? "Generando..." : "Solicitar Mi Reporte Anual"}
                                    </Button>
                                    <p className="text-xs text-muted-foreground/60">
                                        Incluido en tu plan Premium · Un reporte al año
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
