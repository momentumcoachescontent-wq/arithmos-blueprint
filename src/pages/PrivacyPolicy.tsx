import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Scale } from "lucide-react";
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
                    <h1 className="font-serif font-bold text-xl tracking-tight text-gradient-silver">Política de Privacidad</h1>
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
                    <p className="text-muted-foreground leading-relaxed">
                        En **Arithmos AI Strategist**, tu privacidad y la integridad de tu camino estratégico son nuestra máxima prioridad. Esta política detalla cómo manejamos tus datos en nuestra plataforma PWA/TWA.
                    </p>
                    <p className="text-xs text-muted-foreground italic">Última actualización: 6 de marzo, 2026</p>
                </motion.div>

                <section className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-secondary/50 p-2 rounded-md">
                            <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-lg font-semibold">1. Datos que Recolectamos</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Recolectamos datos básicos para calcular tu Blueprint Numerológico: Nombre, Fecha de Nacimiento y, opcionalmente, número de teléfono para comunicaciones estratégicas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-secondary/50 p-2 rounded-md">
                            <Lock className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-lg font-semibold">2. Uso de Inteligencia Artificial</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Utilizamos la tecnología GPT-4o de **OpenAI** para generar interpretaciones personalizadas. Tus datos se envían de forma anónima y sanitizada para procesar únicamente la lógica narrativa del Coach de Sombras y el Blueprint. OpenAI no utiliza estos datos para entrenar sus modelos según nuestros acuerdos de API empresarial.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-secondary/50 p-2 rounded-md">
                            <Scale className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-lg font-semibold">3. Almacenamiento y Seguridad</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Tus datos están resguardados en **Supabase** (infraestructura AWS) con cifrado de grado militar. La persistencia de sesión en tu dispositivo utiliza `sessionStorage` para asegurar que tu información no permanezca expuesta tras cerrar la aplicación.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="glass rounded-2xl p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <h2 className="font-serif text-xl font-bold mb-4">4. Pagos y Suscripciones</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        Todas las transacciones son procesadas por **Stripe**. Arithmos nunca almacena los datos de tu tarjeta de crédito o débito. Stripe Link y otros métodos de pago se rigen bajo los términos de seguridad de Stripe.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Para cualquier solicitud de rectificación o eliminación de datos (Derechos ARCO), puedes contactar al administrador desde el portal de soporte.
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
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Arithmos — Poder a través de la Claridad</p>
                </footer>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
