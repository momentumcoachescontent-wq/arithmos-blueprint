import { ReactNode } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface ProFeatureGateProps {
    /** Contenido visible para el usuario Premium */
    children: ReactNode;
    /** Rol actual del usuario */
    userRole?: string;
    /** Nombre de la feature bloqueada (para el modal) */
    featureName?: string;
    /** ID del usuario para el checkout */
    userId?: string;
    /** Modo de bloqueo: 'overlay' (predeterminado) o 'click' (discreto) */
    mode?: "overlay" | "click";
}

/**
 * Envuelve features Pro con una pantalla de bloqueo elegante.
 * Si `userRole` es "premium" o "admin", renderiza children directamente.
 * Si no, redirige directamente al flujo de pago de Stripe al hacer clic.
 */
export function ProFeatureGate({
    children,
    userRole,
    featureName = "Esta función",
    userId,
    mode = "overlay",
}: ProFeatureGateProps) {
    const { redirectToCheckout, isLoading } = useSubscription(userId);
    const isPremium = userRole === "premium" || userRole === "admin";

    if (isPremium) {
        return <>{children}</>;
    }

    const handleUpgradeClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) {
            await redirectToCheckout();
        }
    };

    if (mode === "click") {
        return (
            <div onClick={handleUpgradeClick} className={`relative cursor-pointer ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}>
                {children}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl backdrop-blur-sm z-50">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative select-none">
            {/* Contenido borroso */}
            <div className={`pointer-events-none opacity-40 blur-sm ${isLoading ? 'opacity-20' : ''}`}>
                {children}
            </div>

            {/* Overlay de bloqueo */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer group ${isLoading ? 'pointer-events-none' : ''}`}
                onClick={handleUpgradeClick}
            >
                <div className="glass rounded-xl p-6 text-center border border-primary/30 shadow-xl shadow-primary/10 transition-all group-hover:border-primary/60 group-hover:shadow-primary/20 max-w-xs relative overflow-hidden flex flex-col items-center">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                            <p className="text-sm font-serif font-semibold text-foreground mb-1">Conectando con Stripe...</p>
                            <p className="text-xs text-muted-foreground font-sans">Preparando pasarela segura</p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary/30 mb-3">
                                <Lock className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-sm font-serif font-semibold text-foreground mb-1">{featureName}</p>
                            <p className="text-xs text-muted-foreground font-sans mb-3">Exclusivo del plan Premium</p>
                            <span className="text-xs text-primary font-sans font-bold uppercase tracking-widest group-hover:underline">
                                Activar Premium →
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
