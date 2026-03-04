import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    User,
    Lock,
    Bell,
    MessageSquare,
    Save,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    ExternalLink,
    CreditCard,
    Zap,
    Loader2,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStats } from "@/hooks/useStats";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────
// Section component helper
// ─────────────────────────────────────
const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 space-y-5"
    >
        <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Icon className="h-4 w-4 text-primary" />
            <h2 className="font-serif font-semibold text-foreground">{title}</h2>
        </div>
        {children}
    </motion.div>
);

// ─────────────────────────────────────
// Toast de feedback
// ─────────────────────────────────────
const Feedback = ({ message, type }: { message: string; type: "ok" | "err" }) => (
    <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 text-sm font-sans px-4 py-2 rounded-lg mt-2 ${type === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            }`}
    >
        {type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        {message}
    </motion.div>
);

// ─────────────────────────────────────
// Page
// ─────────────────────────────────────
const Settings = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { profile } = useProfile();
    const { stats, toggleRanking } = useStats(user?.id);
    const { redirectToCheckout, redirectToPortal, isLoading: stripeLoading } = useSubscription(user?.id);
    const isPremium = profile?.role === 'premium' || profile?.role === 'admin';

    // ── Contraseña ──
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [pwdStatus, setPwdStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);
    const [savingPwd, setSavingPwd] = useState(false);

    // ── Discord ──
    const [discordWebhook, setDiscordWebhook] = useState(
        () => localStorage.getItem("arithmos_discord_webhook") || ""
    );
    const [shareDiscord, setShareDiscord] = useState(
        () => localStorage.getItem("arithmos_discord_share") === "true"
    );
    const [discordStatus, setDiscordStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);
    const [testingWebhook, setTestingWebhook] = useState(false);

    // ── Notificaciones Push ──
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushStatus, setPushStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);

    // ── Ranking ──
    const [showInRanking, setShowInRanking] = useState(stats?.showInRanking ?? false);

    useEffect(() => {
        if (!isAuthenticated) navigate("/onboarding");
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (stats) setShowInRanking(stats.showInRanking);
    }, [stats]);

    // Check push permission on mount
    useEffect(() => {
        if ("Notification" in window) {
            setPushEnabled(Notification.permission === "granted");
        }
    }, []);

    // ─────────── Cambiar contraseña ───────────
    const handlePasswordChange = async () => {
        setPwdStatus(null);
        if (newPwd !== confirmPwd) {
            setPwdStatus({ message: "Las contraseñas no coinciden.", type: "err" });
            return;
        }
        if (newPwd.length < 8) {
            setPwdStatus({ message: "La contraseña debe tener al menos 8 caracteres.", type: "err" });
            return;
        }
        setSavingPwd(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPwd });
            if (error) throw error;
            setPwdStatus({ message: "Contraseña actualizada correctamente.", type: "ok" });
            setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
        } catch (err: any) {
            setPwdStatus({ message: err.message || "Error al cambiar contraseña.", type: "err" });
        } finally {
            setSavingPwd(false);
        }
    };

    // ─────────── Guardar Webhook Discord ───────────
    const handleSaveDiscord = () => {
        localStorage.setItem("arithmos_discord_webhook", discordWebhook);
        localStorage.setItem("arithmos_discord_share", String(shareDiscord));
        setDiscordStatus({ message: "Configuración de Discord guardada.", type: "ok" });
        setTimeout(() => setDiscordStatus(null), 3000);
    };

    // ─────────── Probar Webhook ───────────
    const handleTestWebhook = async () => {
        if (!discordWebhook.startsWith("https://discord.com/api/webhooks/")) {
            setDiscordStatus({ message: "URL de Webhook no válida.", type: "err" });
            return;
        }
        setTestingWebhook(true);
        setDiscordStatus(null);
        try {
            const res = await fetch(discordWebhook, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    embeds: [{
                        title: "⚡ Arithmos Conectado",
                        description: `**${profile?.name || user?.name}** ha vinculado su cuenta de Arithmos a este canal.\n\nSus victorias y logros se publicarán aquí automáticamente.`,
                        color: 5814783,
                        footer: { text: "Arithmos — Tu Poder Estratégico" },
                    }],
                }),
            });
            if (res.ok) {
                setDiscordStatus({ message: "✅ Mensaje de prueba enviado al canal de Discord.", type: "ok" });
            } else {
                setDiscordStatus({ message: `Error HTTP ${res.status}. Verifica la URL.`, type: "err" });
            }
        } catch {
            setDiscordStatus({ message: "No se pudo conectar. Verifica la URL.", type: "err" });
        } finally {
            setTestingWebhook(false);
        }
    };

    // ─────────── Activar Push Notifications ───────────
    const handleTogglePush = async () => {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
            setPushStatus({ message: "Tu navegador no soporta notificaciones push.", type: "err" });
            return;
        }
        if (Notification.permission === "granted") {
            setPushStatus({ message: "Notificaciones ya están activas.", type: "ok" });
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setPushEnabled(true);
            setPushStatus({ message: "¡Notificaciones activadas! Recibirás recordatorios de misiones.", type: "ok" });
        } else {
            setPushStatus({ message: "Permiso denegado. Habilita las notificaciones en tu navegador.", type: "err" });
        }
    };

    // ─────────── Toggle Ranking ───────────
    const handleRankingToggle = async (checked: boolean) => {
        setShowInRanking(checked);
        await toggleRanking(checked);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border px-6 py-4 sticky top-0 z-10 bg-background/80 backdrop-blur">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </button>
                    <span className="font-serif text-foreground">Configuración</span>
                    <div className="w-24" />
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
                {/* ─── Cuenta ─── */}
                <Section title="Mi Cuenta" icon={User}>
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-sans">Nombre</Label>
                        <p className="font-serif text-foreground text-lg">{profile?.name || user.name}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-sans">Email</Label>
                        <p className="font-sans text-foreground">
                            {user.email || (
                                <span className="text-muted-foreground italic text-sm">
                                    Sin email — cuenta anónima.{" "}
                                    <button
                                        className="text-primary underline-offset-2 hover:underline"
                                        onClick={() => navigate("/onboarding?register=true")}
                                    >
                                        Registrarse
                                    </button>
                                </span>
                            )}
                        </p>
                    </div>

                    {user.isAnonymous && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm font-sans text-amber-300 space-y-2">
                            <p className="font-semibold">⚠️ Cuenta Anónima</p>
                            <p>Tus datos están solo en este dispositivo. Regístrate para protegerlos y acceder desde cualquier lugar.</p>
                            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10" onClick={() => navigate("/onboarding?register=true")}>
                                Crear Cuenta Real →
                            </Button>
                        </div>
                    )}
                </Section>

                {/* ─── Cambiar Contraseña (solo usuarios registrados) ─── */}
                {!user.isAnonymous && (
                    <Section title="Seguridad" icon={Lock}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-sans text-sm text-muted-foreground">Nueva contraseña</Label>
                                <div className="relative">
                                    <Input
                                        type={showPwd ? "text" : "password"}
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        className="pr-10"
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
                            <div className="space-y-2">
                                <Label className="font-sans text-sm text-muted-foreground">Confirmar contraseña</Label>
                                <Input
                                    type={showPwd ? "text" : "password"}
                                    value={confirmPwd}
                                    onChange={(e) => setConfirmPwd(e.target.value)}
                                    placeholder="Repite la contraseña"
                                />
                            </div>
                            <Button
                                onClick={handlePasswordChange}
                                disabled={savingPwd || !newPwd || !confirmPwd}
                                size="sm"
                                className="w-full"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {savingPwd ? "Guardando…" : "Actualizar Contraseña"}
                            </Button>
                            {pwdStatus && <Feedback {...pwdStatus} />}
                        </div>
                    </Section>
                )}

                {/* ─── Discord ─── */}
                <Section title="Integración Discord" icon={MessageSquare}>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                        Conecta un canal de Discord para publicar tus victorias, logros y subidas de nivel en tu comunidad automáticamente.
                    </p>

                    <div className="space-y-2">
                        <Label className="font-sans text-sm text-muted-foreground">URL del Webhook</Label>
                        <Input
                            placeholder="https://discord.com/api/webhooks/..."
                            value={discordWebhook}
                            onChange={(e) => setDiscordWebhook(e.target.value)}
                            className="font-mono text-xs"
                        />
                        <a
                            href="https://support.discord.com/hc/es/articles/228383668"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline font-sans"
                        >
                            ¿Cómo crear un Webhook en Discord? <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div>
                            <p className="text-sm font-sans text-foreground">Compartir victorias automáticamente</p>
                            <p className="text-xs text-muted-foreground font-sans">Al completar misiones y subir de nivel</p>
                        </div>
                        <Switch
                            checked={shareDiscord}
                            onCheckedChange={(v) => {
                                setShareDiscord(v);
                                localStorage.setItem("arithmos_discord_share", String(v));
                            }}
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={handleSaveDiscord} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleTestWebhook}
                            disabled={testingWebhook || !discordWebhook}
                            className="flex-1"
                        >
                            {testingWebhook ? "Enviando..." : "🧪 Probar Webhook"}
                        </Button>
                    </div>

                    {discordStatus && <Feedback {...discordStatus} />}
                </Section>

                {/* ─── Notificaciones Push ─── */}
                <Section title="Notificaciones Push" icon={Bell}>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                        Recibe recordatorios diarios para que nunca pierdas tu racha de misiones.
                    </p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-sans text-foreground">
                                {pushEnabled ? "✅ Notificaciones activas" : "Activar recordatorios de misiones"}
                            </p>
                            <p className="text-xs text-muted-foreground font-sans">Requiere permiso del navegador</p>
                        </div>
                        <Button
                            size="sm"
                            variant={pushEnabled ? "outline" : "default"}
                            onClick={handleTogglePush}
                            disabled={pushEnabled}
                        >
                            {pushEnabled ? "Activas" : "Activar"}
                        </Button>
                    </div>
                    {pushStatus && <Feedback {...pushStatus} />}
                </Section>

                {/* ─── Comunidad / Ranking ─── */}
                <Section title="Comunidad" icon={User}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-sans text-foreground">Aparecer en el Tribunal de Poder</p>
                            <p className="text-xs text-muted-foreground font-sans">
                                Tu nombre y XP serán visibles en el ranking comunitario
                            </p>
                        </div>
                        <Switch
                            checked={showInRanking}
                            onCheckedChange={handleRankingToggle}
                        />
                    </div>
                </Section>

                {/* ─── Suscripción ─── */}
                {!user.isAnonymous && (
                    <Section title="Mi Suscripción" icon={CreditCard}>
                        {isPremium ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-sans font-semibold text-foreground">Plan Premium Activo</p>
                                        <p className="text-xs text-muted-foreground font-sans">
                                            {profile?.subscription_status === 'past_due' ? '⚠️ Pago pendiente — actualiza tu método de pago' : 'Acceso completo a todas las funciones Pro'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full font-sans text-sm"
                                    onClick={() => redirectToPortal()}
                                    disabled={stripeLoading}
                                >
                                    {stripeLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                                    Gestionar Suscripción en Stripe
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                                    Estás en el plan <strong>Freemium</strong>. Actualiza a Premium para desbloquear el Radar de Equipo, reportes PDF y consultas ilimitadas.
                                </p>
                                <Button
                                    className="w-full gap-2 font-bold font-sans"
                                    onClick={() => redirectToCheckout()}
                                    disabled={stripeLoading}
                                >
                                    {stripeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                    Activar Premium — $9.99/mes
                                </Button>
                            </div>
                        )}
                    </Section>
                )}

                {/* ─── Cerrar Sesión ─── */}
                <div className="pt-4">
                    <Button
                        variant="ghost"
                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 font-sans text-sm"
                        onClick={async () => {
                            await logout();
                            navigate("/");
                        }}
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
