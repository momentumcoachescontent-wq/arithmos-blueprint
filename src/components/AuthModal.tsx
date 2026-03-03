import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type PlanType = "freemium" | "premium" | "team";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: "login" | "register";
    selectedPlan?: PlanType;
}

// ── Plan labels ──
const planLabels: Record<PlanType, string> = {
    freemium: "Freemium",
    premium: "The Empowered Path",
    team: "Team Plan B2B",
};

export function AuthModal({ isOpen, onClose, defaultTab = "register", selectedPlan }: AuthModalProps) {
    const navigate = useNavigate();
    const { loginWithEmail, registerWithEmail } = useAuth();

    const [tab, setTab] = useState<"login" | "register">(defaultTab);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const roleFromPlan = (plan?: PlanType): string => {
        if (plan === "premium" || plan === "team") return "premium";
        return "freemium";
    };

    const handleRegister = async () => {
        setError(null);
        if (!fullName.trim()) { setError("Ingresa tu nombre completo."); return; }
        if (!email.trim()) { setError("Ingresa tu email."); return; }
        if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }

        setLoading(true);
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName.trim() } },
            });

            if (signUpError) {
                // "User already registered" (error 422)
                if (signUpError.message?.includes("already registered") || signUpError.status === 422) {
                    setError("Este email ya tiene una cuenta. Usa la pestaña Iniciar Sesión.");
                } else {
                    setError(signUpError.message || "Error al crear la cuenta.");
                }
                return;
            }

            const newUser = data?.user;

            // Caso: email confirmation requerida (identities = [], user existe pero sin confirmar)
            const needsConfirmation = newUser && (!data.session || newUser.identities?.length === 0);

            if (needsConfirmation) {
                setSuccess("✅ ¡Revisa tu email! Te enviamos un enlace de confirmación. Tras confirmar, inicia sesión.");
                return;
            }

            if (newUser && data.session) {
                // Guardamos el usuario en auth local
                localStorage.setItem("arithmos_user", JSON.stringify({
                    id: newUser.id,
                    name: fullName.trim(),
                    email: email,
                    isAnonymous: false,
                }));
                setSuccess("¡Cuenta creada! Redirigiendo para completar tu perfil...");
                setTimeout(() => {
                    onClose();
                    navigate("/onboarding");
                }, 1800);
            } else {
                setError("No se pudo crear la cuenta. Verifica que el email sea válido.");
            }
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err.message || "Error inesperado al crear la cuenta.");
        } finally {
            setLoading(false);
        }
    };


    const handleLogin = async () => {
        setError(null);
        if (!email.trim() || !password) { setError("Completa tu email y contraseña."); return; }
        setLoading(true);
        try {
            await loginWithEmail(email, password);
            onClose();
            navigate("/dashboard");
        } catch (err: any) {
            if (err.message?.includes("Invalid login")) {
                setError("Email o contraseña incorrectos.");
            } else {
                setError(err.message || "Error iniciando sesión.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") tab === "login" ? handleLogin() : handleRegister();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="glass rounded-2xl p-8 w-full max-w-md shadow-2xl pointer-events-auto relative border border-border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-xs font-sans uppercase tracking-widest text-primary">Arithmos</span>
                            </div>

                            {/* Plan badge */}
                            {selectedPlan && tab === "register" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-sans text-primary inline-block"
                                >
                                    Plan: <span className="font-semibold">{planLabels[selectedPlan]}</span>
                                </motion.div>
                            )}

                            <h2 className="text-2xl font-serif font-semibold text-foreground mb-1">
                                {tab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
                            </h2>
                            <p className="text-sm text-muted-foreground font-sans mb-6">
                                {tab === "login"
                                    ? "Accede a tu blueprint y continúa tu progreso."
                                    : "Comienza tu viaje de inteligencia estratégica."}
                            </p>

                            {/* Tabs */}
                            <div className="flex bg-secondary rounded-xl p-1 mb-6">
                                {(["register", "login"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                                        className={`flex-1 py-2 text-sm font-sans rounded-lg transition-all ${tab === t
                                            ? "bg-card text-foreground shadow-sm font-medium"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {t === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                                    </button>
                                ))}
                            </div>

                            {/* Form */}
                            <div className="space-y-4" onKeyDown={handleKey}>
                                {tab === "register" && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-sans text-muted-foreground">Nombre completo</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Tu nombre"
                                                className="pl-10"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-sm font-sans text-muted-foreground">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="pl-10"
                                            autoFocus={tab === "login"}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-sans text-muted-foreground">Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPwd ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={tab === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                                            className="pl-10 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error / Success */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="text-sm text-red-400 font-sans bg-red-500/10 px-4 py-2 rounded-lg"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                    {success && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-emerald-400 font-sans bg-emerald-500/10 px-4 py-2 rounded-lg"
                                        >
                                            {success}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <Button
                                    onClick={tab === "login" ? handleLogin : handleRegister}
                                    disabled={loading}
                                    className="w-full glow-indigo group"
                                >
                                    {loading
                                        ? "Procesando..."
                                        : tab === "login"
                                            ? "Entrar"
                                            : "Crear Cuenta"}
                                    {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                </Button>

                                {/* Quick access — free trial */}
                                {tab === "register" && (
                                    <p className="text-center text-xs text-muted-foreground font-sans pt-1">
                                        ¿Solo quieres explorar?{" "}
                                        <button
                                            className="text-primary hover:underline"
                                            onClick={() => { onClose(); navigate("/onboarding"); }}
                                        >
                                            Consulta sin registrarte →
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
