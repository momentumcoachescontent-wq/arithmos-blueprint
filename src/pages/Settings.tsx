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
    CalendarIcon,
    Phone,
    Shield,
    ExternalLink,
    CreditCard,
    Zap,
    Loader2,
    Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
    const { profile, createProfile } = useProfile();
    const { stats, fetchStats, toggleRanking } = useStats(user?.id);
    const { redirectToCheckout, redirectToPortal, isLoading: stripeLoading, isPremium: subIsPremium, isTrialExpired } = useSubscription(user?.id);
    const isPremium = profile?.role === 'admin' || (subIsPremium && !isTrialExpired);

    // ── Perfil Editable ──
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState<Date>();
    const [profileStatus, setProfileStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setPhone(profile.phone || "");
            if (profile.birthDate) {
                try { setBirthDate(parseISO(profile.birthDate)); }
                catch (e) { console.error("Error parsing date:", e); }
            }
        }
    }, [profile]);

    // ── Cargar estadísticas al entrar ──
    useEffect(() => {
        if (user?.id) fetchStats(user.id);
    }, [user?.id, fetchStats]);

    // ── Contraseña ──
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [pwdStatus, setPwdStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);
    const [savingPwd, setSavingPwd] = useState(false);


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

    // ─────────── Guardar Perfil ───────────
    const handleSaveProfile = async () => {
        setProfileStatus(null);
        if (!name.trim()) { setProfileStatus({ message: "El nombre es obligatorio.", type: "err" }); return; }
        if (!birthDate) { setProfileStatus({ message: "La fecha de nacimiento es obligatoria.", type: "err" }); return; }

        setSavingProfile(true);
        try {
            const dateStr = format(birthDate, "yyyy-MM-dd");
            await createProfile(name.trim(), dateStr, user?.id, phone.trim());
            setProfileStatus({ message: "Perfil actualizado correctamente.", type: "ok" });
            setTimeout(() => setProfileStatus(null), 3000);
        } catch (err: any) {
            setProfileStatus({ message: err.message || "Error al actualizar perfil.", type: "err" });
        } finally {
            setSavingProfile(false);
        }
    };

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
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-sans text-sm text-muted-foreground">Nombre completo</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-sans text-sm text-muted-foreground">Teléfono (WhatsApp)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+52 1 234..."
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-sans text-sm text-muted-foreground">Fecha de Nacimiento</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-secondary/50 border-border h-10",
                                            !birthDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {birthDate ? format(birthDate, "PPP", { locale: es }) : "Selecciona tu fecha"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={birthDate}
                                        onSelect={setBirthDate}
                                        disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
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

                        <Button
                            onClick={handleSaveProfile}
                            disabled={savingProfile || !name.trim() || !birthDate}
                            className="w-full mt-2"
                        >
                            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {savingProfile ? "Guardando..." : "Guardar Cambios de Perfil"}
                        </Button>
                        {profileStatus && <Feedback {...profileStatus} />}
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

                    <div className="pt-4 border-t border-border/50">
                        <button
                            onClick={() => navigate("/privacy")}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-sans"
                        >
                            <Shield className="h-3 w-3" />
                            Política de Privacidad
                        </button>
                        <button
                            onClick={() => navigate("/delete-account")}
                            className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors font-sans"
                        >
                            <Trash2 className="h-3 w-3" />
                            Eliminar Cuenta y Datos
                        </button>
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
