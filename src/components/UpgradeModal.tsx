import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Zap, Shield, Users, BookOpen, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    featureRequested?: string;
}

const features = [
    { icon: Zap, text: "Radar de Equipo: compatibilidad numérica de tu equipo" },
    { icon: BookOpen, text: "Reporte Deep Dive Anual en PDF (15+ páginas)" },
    { icon: Users, text: "Consultas ilimitadas con el Coach AI" },
    { icon: Shield, text: "Acceso a la comunidad Discord privada" },
    { icon: Sparkles, text: "Daily Pulse avanzado con ciclos mensuales" },
];

export function UpgradeModal({ isOpen, onClose, userId, featureRequested }: UpgradeModalProps) {
    const { redirectToCheckout, isLoading, error } = useSubscription(userId);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-md glass rounded-2xl p-8 border border-primary/30 shadow-2xl shadow-primary/20 z-10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                                Desbloquea tu Potencial Premium
                            </h2>
                            {featureRequested && (
                                <p className="text-sm text-muted-foreground font-sans">
                                    <span className="text-primary font-semibold">{featureRequested}</span> es una función exclusiva del plan Premium.
                                </p>
                            )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                            {features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                                        <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="text-sm text-muted-foreground font-sans leading-snug">{f.text}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Price */}
                        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center mb-6">
                            <span className="text-3xl font-serif font-bold text-foreground">$9.99</span>
                            <span className="text-muted-foreground font-sans text-sm"> / mes</span>
                            <p className="text-xs text-muted-foreground mt-1 font-sans">Cancela cuando quieras</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-sm text-rose-400 text-center mb-4 font-sans">{error}</p>
                        )}

                        {/* CTA Button */}
                        <Button
                            onClick={() => redirectToCheckout()}
                            disabled={isLoading}
                            className="w-full h-12 text-base font-sans font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Preparando tu pago...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" />
                                    Activar Premium Ahora
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-4 font-sans">
                            Pago seguro via Stripe · Sin contratos · Sin sorpresas
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
