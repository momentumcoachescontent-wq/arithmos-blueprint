import { ReactNode, useState } from "react";
import { Lock } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";

interface ProFeatureGateProps {
    /** Contenido visible para el usuario Premium */
    children: ReactNode;
    /** Rol actual del usuario */
    userRole?: string;
    /** Nombre de la feature bloqueada (para el modal) */
    featureName?: string;
    /** ID del usuario para el checkout */
    userId?: string;
}

/**
 * Envuelve features Pro con una pantalla de bloqueo elegante.
 * Si `userRole` es "premium" o "admin", renderiza children directamente.
 * Si no, muestra un overlay con CTA de upgrade.
 */
export function ProFeatureGate({
    children,
    userRole,
    featureName = "Esta función",
    userId,
}: ProFeatureGateProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const isPremium = userRole === "premium" || userRole === "admin";

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Contenido bloqueado con overlay */}
            <div className="relative select-none">
                {/* Contenido borroso */}
                <div className="pointer-events-none opacity-40 blur-sm">
                    {children}
                </div>

                {/* Overlay de bloqueo */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => setModalOpen(true)}
                >
                    <div className="glass rounded-xl p-6 text-center border border-primary/30 shadow-xl shadow-primary/10 transition-all group-hover:border-primary/60 group-hover:shadow-primary/20 max-w-xs">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary/30 mb-3">
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm font-serif font-semibold text-foreground mb-1">{featureName}</p>
                        <p className="text-xs text-muted-foreground font-sans mb-3">Exclusivo del plan Premium</p>
                        <span className="text-xs text-primary font-sans font-bold uppercase tracking-widest group-hover:underline">
                            Activar Premium →
                        </span>
                    </div>
                </div>
            </div>

            <UpgradeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userId={userId}
                featureRequested={featureName}
            />
        </>
    );
}
