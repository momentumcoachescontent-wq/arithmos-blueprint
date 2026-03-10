import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ShieldAlert, Database, History, HelpCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const DataDeletion = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user) return;

        const confirmDelete = window.confirm(
            "¿Estás seguro de que deseas eliminar permanentemente tu cuenta? Esta acción es irreversible y eliminará todos tus registros, lecturas y progreso estratégico."
        );

        if (!confirmDelete) return;

        setLoading(true);
        try {
            // Llamamos a la función RPC que maneja la eliminación segura (si existe) 
            // o lo hacemos vía Supabase Auth
            const { error } = await supabase.rpc('admin_delete_user', {
                target_user_id: user.id
            });

            if (error) {
                // Si la RPC falla por permisos, intentamos simplemente cerrar sesión e informar
                // En un flujo real, aquí se gatillaría un webhook o proceso de borrado
                throw error;
            }

            setSuccess(true);
            setTimeout(async () => {
                await logout();
                navigate("/");
            }, 5000);
        } catch (error: any) {
            console.error("Error deleting account:", error);
            alert("Hubo un problema al procesar la solicitud. Por favor, contacta a soporte@arithmos.mx");
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="font-serif font-bold text-xl tracking-tight text-gradient-silver">Soberanía de Datos</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                >
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold">Derecho al Olvido</h2>
                    <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
                        En **Arithmos**, respetamos tu proceso. Si decides que tu camino estratégico con nosotros ha llegado a su fin, tienes el poder absoluto de purgar tu presencia de nuestros sistemas.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-config-2">
                    <section className="glass p-6 rounded-2xl border-border/50 space-y-4">
                        <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-primary" />
                            <h3 className="font-serif font-bold">¿Qué datos se eliminan?</h3>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 leading-relaxed">
                            <li>Perfil personal (Nombre, Fecha de Nacimiento).</li>
                            <li>Historial de lecturas y Blueprints generados.</li>
                            <li>Registros de sincronicidad y diario del Coach.</li>
                            <li>Progreso en misiones y estadísticas de XP.</li>
                            <li>Vinculación con pasarelas de pago (Stripe).</li>
                        </ul>
                    </section>

                    <section className="glass p-6 rounded-2xl border-border/50 space-y-4">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-amber-400" />
                            <h3 className="font-serif font-bold">Consideraciones</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Esta acción es **final e irreversible**. No podremos recuperar tu información una vez confirmada la purga. Si tienes una suscripción activa, se cancelará automáticamente.
                        </p>
                    </section>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-8 border border-border text-center space-y-6">
                    {!success ? (
                        <>
                            <h3 className="font-serif text-xl font-bold">Solicitar Eliminación</h3>

                            {isAuthenticated ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Detectamos tu sesión activa. Puedes proceder con la eliminación automática.
                                    </p>
                                    <Button
                                        variant="destructive"
                                        className="gap-2 px-8"
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {loading ? "Procesando..." : "Eliminar mi cuenta permanentemente"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Si no tienes acceso a tu cuenta o deseas solicitar el borrado de forma manual, por favor envía un correo desde la dirección registrada:
                                    </p>
                                    <a
                                        href="mailto:soporte@arithmos.mx?subject=Solicitud de Eliminación de Cuenta&body=Deseo solicitar la eliminación total de mi cuenta y datos asociados en Arithmos AI Strategist. Mi correo registrado es: "
                                        className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                                    >
                                        soporte@arithmos.mx
                                    </a>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4">
                                        Atención en menos de 48 horas hábiles.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-4"
                        >
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                            <h3 className="font-serif text-xl font-bold text-emerald-400">Solicitud Procesada</h3>
                            <p className="text-sm text-muted-foreground">
                                Tu cuenta ha sido marcada para eliminación. Serás redirigido en unos segundos.
                                Gracias por haber sido parte de Arithmos.
                            </p>
                        </motion.div>
                    )}
                </div>

                <footer className="pt-12 border-t border-border flex flex-col items-center gap-6 text-center">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <HelpCircle className="h-4 w-4" />
                        <span>¿Dudas sobre tus derechos? Lee nuestra <button onClick={() => navigate("/privacidad")} className="text-primary hover:underline">Política de Privacidad</button></span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">Arithmos — Poder a través de la Resiliencia</p>
                </footer>
            </main>
        </div>
    );
};

export default DataDeletion;
