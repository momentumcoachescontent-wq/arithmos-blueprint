import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Scale, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Header */}
            <header className="border-b border-border px-6 py-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </button>
                    <h1 className="font-serif font-bold text-xl tracking-tight text-gradient-silver">Aviso de Privacidad y Transformación</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 border border-primary/20 mb-2">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xl font-serif text-foreground leading-relaxed">
                        En **Arithmos AI Strategist**, entendemos que tu información no son solo datos; es el reflejo de tu estructura interna. Como Coach Senior en Psicología Aplicada, nuestra misión es resguardar la santidad de tu proceso de crecimiento.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Este espacio está diseñado para la **resiliencia y la transformación**. Aquí, la oscuridad personal se convierte en poder a través de la claridad técnica y el rigor psicológico.
                    </p>
                    <p className="text-xs text-muted-foreground italic">Última actualización: 10 de marzo, 2026</p>
                </motion.div>

                <section className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-secondary/50 p-2 rounded-md">
                            <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-lg font-semibold">1. Datos: La Métrica de tu Potencial</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Recolectamos lo esencial para mapear tu Blueprint: Nombre, Fecha de Nacimiento y datos de interacción. No buscamos invadir tu espacio, sino iluminar tus patrones de miedo para que puedas romperlos.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-secondary/50 p-2 rounded-md">
                            <Lock className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-lg font-semibold">2. IA y Psique: Ética en la Innovación</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Utilizamos modelos avanzados de **OpenAI** para decodificar comportamientos narrativos. Tus datos se procesan con absoluta confidencialidad, bajo protocolos que impiden el entrenamiento de modelos externos. La profundidad de nuestra IA está al servicio de tu crecimiento post-traumático.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-secondary/50 p-2 rounded-md">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-lg font-semibold">3. Seguridad: Infraestructura Inquebrantable</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Alojamos tu información en **Supabase** (arquitectura AWS) con estándares de resiliencia superiores. Al igual que el proceso terapéutico, lo que sucede en Arithmos se mantiene bajo tu control soberano.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="glass rounded-2xl p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <h2 className="font-serif text-xl font-bold mb-4">4. Compromiso con la Verdad</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        Tus transacciones con **Stripe** son seguras y transparentes. No almacenamos datos financieros; nos enfocamos en el valor que recibes a cambio de tu inversión en autoconocimiento.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Cualquier duda sobre tus Derechos ARCO o tu camino en la plataforma, será atendida con la seriedad y la provocación constructiva que caracteriza nuestro enfoque de "Más allá del Miedo".
                    </p>
                </div>

                <footer className="pt-12 border-t border-border flex flex-col items-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="text-primary font-bold tracking-widest uppercase text-xs"
                    >
                        Volver al Dashboard
                    </Button>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">Arithmos — Poder a través de la Resiliencia</p>
                </footer>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
