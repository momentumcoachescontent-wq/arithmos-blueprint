import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Users, Plus, Trash2, ArrowLeft, Sparkles, Zap,
    ChevronDown, ChevronUp, RefreshCw, Save, History as HistoryIcon, Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── Numerología ──────────────────────────────────────
function reduceNumber(n: number): number {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n <= 9) return n;
    return reduceNumber(String(n).split("").reduce((a, d) => a + parseInt(d), 0));
}

function getLifePath(birthDate: string): number {
    const digits = birthDate.replace(/-/g, "").split("").map(Number);
    return reduceNumber(digits.reduce((a, b) => a + b, 0));
}

const lifePathTraits: Record<number, { strength: string; shadow: string; energy: string; mission: string }> = {
    1: { strength: "Liderazgo e iniciativa", shadow: "Egocentrismo", energy: "Pionero", mission: "Liderar con autonomía y abrir nuevos caminos." },
    2: { strength: "Diplomacia y empatía", shadow: "Indecisión", energy: "Mediador", mission: "Crear puentes y cohesionar con sensibilidad." },
    3: { strength: "Creatividad y expresión", shadow: "Superficialidad", energy: "Creativo", mission: "Inspirar a través del arte y la comunicación." },
    4: { strength: "Estructura y disciplina", shadow: "Rigidez", energy: "Constructor", mission: "Edificar sistemas sólidos y duraderos." },
    5: { strength: "Adaptabilidad y libertad", shadow: "Dispersión", energy: "Explorador", mission: "Expandir horizontes y abrazar el cambio." },
    6: { strength: "Cuidado y responsabilidad", shadow: "Perfeccionismo", energy: "Protector", mission: "Servir, sanar y armonizar el entorno." },
    7: { strength: "Análisis y profundidad", shadow: "Aislamiento", energy: "Sabio", mission: "Buscar la verdad y compartir el conocimiento." },
    8: { strength: "Poder y abundancia", shadow: "Autoritarismo", energy: "Ejecutor", mission: "Manifestar poder material con integridad." },
    9: { strength: "Humanismo y visión global", shadow: "Sacrificio excesivo", energy: "Visionario", mission: "Elevar a la humanidad con compasión y sabiduría." },
    11: { strength: "Intuición y revelación", shadow: "Ansiedad", energy: "Iluminador", mission: "Ser canal espiritual e inspirar con la vibración." },
    22: { strength: "Maestría y manifestación", shadow: "Presión extrema", energy: "Arquitecto", mission: "Construir legados que transciendan generaciones." },
    33: { strength: "Servicio y amor incondicional", shadow: "Martirologio", energy: "Maestro", mission: "Enseñar con amor puro y sanar colectivamente." },
};

const collectiveNumberMeaning: Record<number, string> = {
    1: "El equipo está llamado a innovar y liderar en su campo. La energía del 1 impulsa la acción sin demora.",
    2: "La dualidad del 2 pide escucha activa y colaboración. Este equipo crece a través del diálogo.",
    3: "El 3 detona creatividad colectiva. El equipo tiene potencial de comunicar e inspirar a gran escala.",
    4: "El 4 estructura el potencial. Este equipo construye cimiento sólido — lento pero inconmovible.",
    5: "El 5 exige adaptación y apertura al cambio. Este equipo prospera en entornos dinámicos e impredecibles.",
    6: "El 6 centra al equipo en el cuidado mutuo y la calidad del entorno. El servicio es su mayor fortaleza.",
    7: "El 7 profundiza. Este equipo tiene la capacidad de investigar y encontrar soluciones que otros pasan por alto.",
    8: "El 8 atrae poder y resultados. Si alinean liderazgo con ética, los logros serán extraordinarios.",
    9: "El 9 cierra ciclos y eleva propósitos. Este equipo tiene vocación de generar impacto real en el mundo.",
    11: "El 11 maestro amplifica la intuición del equipo. Hay un potencial visionario que debe canalizarse con cuidado.",
    22: "El 22 maestro otorga capacidad de materializar proyectos monumentales. Responsabilidad y visión son clave.",
    33: "El 33 maestro convoca al amor colectivo como motor. Este equipo puede ser un agente de transformación profunda.",
};

function getCompatibility(a: number, b: number): string {
    const diff = Math.abs(a - b);
    if (diff === 0) return "Espejo perfecto — gran potencial creativo, también tensión por similitud";
    if ([1, 2].includes(diff)) return "Alta compatibilidad — fluyen naturalmente hacia el mismo objetivo";
    if ([3, 4].includes(diff)) return "Complementarios — se nutren mutuamente con perspectivas distintas";
    return "Energías contrastantes — requieren comunicación consciente para convertir tensión en sinergia";
}

// ─── Tipos ────────────────────────────────────────────
interface TeamMember {
    id: string;
    name: string;
    birth_date: string;
    life_path: number | null;
    isOwner?: boolean;
}

interface SavedTeam {
    id: string;
    title: string;
    members: any[];
    created_at: string;
}

// ─── Componente ───────────────────────────────────────
const RadarEquipo = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile } = useProfile();
    const { isPremium, isTrialExpired } = useSubscription(user?.id);
    const hasAccess = profile?.role === 'admin' || (isPremium && !isTrialExpired);

    // Estado de edición actual
    const [title, setTitle] = useState("Mi Equipo");
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [expandedMember, setExpandedMember] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Historial de equipos guardados
    const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // ── Al cargar: añadir perfil del usuario O cargar borrador ──
    useEffect(() => {
        if (!profile || !user) return;
        const ownerLifePath = profile.birthDate ? getLifePath(profile.birthDate) : null;
        const ownerMember: TeamMember = {
            id: "owner",
            name: profile.name,
            birth_date: profile.birthDate || "",
            life_path: ownerLifePath,
            isOwner: true,
        };

        // Intentar recuperar el borrador guardado en localStorage
        const savedDraft = localStorage.getItem(`arithmos_radar_draft_${user.id}`);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setTitle(parsed.title || "Mi Equipo");
                const draftMembers = parsed.members || [];
                // Actualizar info del dueño por si cambió en el perfil
                const ownerIdx = draftMembers.findIndex((m: any) => m.id === "owner");
                if (ownerIdx !== -1) draftMembers[ownerIdx] = ownerMember;
                else draftMembers.unshift(ownerMember);

                setMembers(draftMembers);
                return;
            } catch (e) {
                console.error("Error cargando borrador del radar:", e);
            }
        }

        // Si no hay borrador, iniciar con un slot vacío
        setMembers([
            ownerMember,
            { id: Date.now().toString(), name: "", birth_date: "", life_path: null },
        ]);
    }, [profile, user]);

    // ── Guardar borrador automáticamente ──
    useEffect(() => {
        if (!user || members.length === 0) return;
        localStorage.setItem(`arithmos_radar_draft_${user.id}`, JSON.stringify({ title, members }));
    }, [members, title, user]);

    // ── Cargar historial de equipos ──
    const loadSavedTeams = useCallback(async () => {
        if (!user) return;
        setIsLoadingHistory(true);
        try {
            const { data } = await supabase
                .from("team_readings" as any)
                .select("id, title, members, created_at")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);
            setSavedTeams((data as unknown as SavedTeam[]) || []);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [user]);

    useEffect(() => { loadSavedTeams(); }, [loadSavedTeams]);

    // ── Cargar equipo guardado ──
    const loadTeam = (team: SavedTeam) => {
        setTitle(team.title);
        setMembers(
            (team.members as any[]).map((m, i) => ({
                id: `loaded-${i}`,
                name: m.name,
                birth_date: m.birth_date,
                life_path: m.life_path,
                isOwner: i === 0,
            }))
        );
        setShowAnalysis(false);
        setShowHistory(false);
        toast.success(`Equipo "${team.title}" cargado.`);
    };

    // ── Gestión de miembros ──
    const addMember = () => {
        if (members.length >= 5) { toast.error("Máximo 5 integrantes."); return; }
        setMembers(prev => [...prev, { id: Date.now().toString(), name: "", birth_date: "", life_path: null }]);
    };

    const removeMember = (id: string) => {
        if (id === "owner") { toast.error("No puedes eliminar tu propio perfil del equipo."); return; }
        if (members.filter(m => !m.isOwner).length <= 1) { toast.error("Mínimo 1 integrante adicional."); return; }
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const updateMember = (id: string, field: "name" | "birth_date", value: string) => {
        setMembers(prev => prev.map(m => {
            if (m.id !== id) return m;
            const updated = { ...m, [field]: value };
            if (field === "birth_date" && value.length === 10) updated.life_path = getLifePath(value);
            return updated;
        }));
    };

    // ── Guardar ──
    const handleSave = async () => {
        if (!user || !canAnalyze) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from("team_readings" as any).insert({
                owner_id: user.id,
                title,
                members: members.map(m => ({ name: m.name, birth_date: m.birth_date, life_path: m.life_path, isOwner: m.isOwner })),
                analysis: JSON.stringify({ collective: collectiveNumber, date: new Date().toISOString() }),
            });
            if (error) throw error;
            toast.success("Análisis guardado en tu Evolución.");
            await loadSavedTeams();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    const canAnalyze = members.length >= 2 && members.every(m => m.name && m.birth_date && m.life_path);
    const collectiveNumber = reduceNumber(members.reduce((a, m) => a + (m.life_path || 0), 0));

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-background px-6 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </button>
                    <div className="flex items-center gap-3">
                        {savedTeams.length > 0 && (
                            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-sans">
                                <HistoryIcon className="h-3.5 w-3.5" /> {savedTeams.length} guardado{savedTeams.length !== 1 ? "s" : ""}
                            </button>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-sans font-bold uppercase tracking-widest border border-indigo-500/20">
                            <Users className="h-3 w-3" /> Feature Pro
                        </div>
                    </div>
                </div>

                <ProFeatureGate isPremium={hasAccess} userId={user?.id || ""} featureName="Radar de Equipo">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-serif font-semibold text-gradient-silver mb-2">Radar de Equipo</h1>
                            <p className="text-muted-foreground font-sans">Analiza la compatibilidad numérica de hasta 5 personas. Tu perfil ya está incluido como punto de referencia del análisis.</p>
                        </div>

                        {/* Historial de equipos guardados */}
                        <AnimatePresence>
                            {showHistory && savedTeams.length > 0 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-xl border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
                                    <h4 className="text-xs font-sans uppercase tracking-widest text-indigo-400 mb-3">Equipos Guardados</h4>
                                    {isLoadingHistory ? (
                                        <p className="text-xs text-muted-foreground font-sans">Cargando...</p>
                                    ) : savedTeams.map(team => (
                                        <button key={team.id} onClick={() => loadTeam(team)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/50 hover:border-indigo-500/30 transition-all text-left">
                                            <div>
                                                <p className="text-sm font-sans font-semibold text-foreground">{team.title}</p>
                                                <p className="text-xs text-muted-foreground">{(team.members as any[]).length} integrantes · {format(new Date(team.created_at), "d MMM yyyy", { locale: es })}</p>
                                            </div>
                                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Nombre del equipo */}
                        <div className="glass rounded-xl p-5 border-border">
                            <label className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-2 block">Nombre del Equipo</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full bg-transparent text-xl font-serif text-foreground border-b border-border/50 focus:border-primary/50 outline-none pb-2 transition-colors"
                                placeholder="Ej: Equipo de Liderazgo Q2" />
                        </div>

                        {/* Miembros */}
                        <div className="space-y-3">
                            {members.map((member, idx) => (
                                <motion.div key={member.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                    className={`glass rounded-xl border overflow-hidden ${member.isOwner ? "border-primary/20 bg-primary/5" : "border-border"}`}>
                                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif font-bold ${member.isOwner ? "bg-primary/20 border border-primary/40 text-primary" : "bg-secondary border border-border text-foreground"}`}>
                                                {member.life_path || (idx + 1)}
                                            </div>
                                            <div>
                                                <span className="font-sans font-semibold text-foreground text-sm">{member.name || `Integrante ${idx + 1}`}</span>
                                                {member.isOwner && <span className="ml-2 text-[10px] text-primary uppercase tracking-wider font-bold">Tú</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.life_path && <span className="text-xs text-primary font-bold px-2 py-0.5 bg-primary/10 rounded-full hidden sm:inline">{lifePathTraits[member.life_path]?.energy || "?"}</span>}
                                            {expandedMember === member.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedMember === member.id && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className="px-4 pb-4 border-t border-border/50 pt-4 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-1 block">Nombre</label>
                                                        <input type="text" value={member.name} disabled={member.isOwner}
                                                            onChange={e => updateMember(member.id, "name", e.target.value)}
                                                            className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm font-sans text-foreground border border-border/50 focus:border-primary/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                                            placeholder="Nombre completo" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-1 block">Fecha de Nacimiento</label>
                                                        <input type="date" value={member.birth_date} disabled={member.isOwner}
                                                            onChange={e => updateMember(member.id, "birth_date", e.target.value)}
                                                            className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm font-sans text-foreground border border-border/50 focus:border-primary/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed" />
                                                    </div>
                                                </div>
                                                {member.life_path && (
                                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                                        <p className="text-xs font-sans text-muted-foreground">
                                                            Camino de Vida <strong className="text-primary">{member.life_path}</strong> — {lifePathTraits[member.life_path]?.strength}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/70 mt-1">Misión: {lifePathTraits[member.life_path]?.mission}</p>
                                                    </div>
                                                )}
                                                {!member.isOwner && (
                                                    <button onClick={() => removeMember(member.id)} className="flex items-center gap-1.5 text-rose-500 text-xs font-sans hover:text-rose-400 transition-colors">
                                                        <Trash2 className="h-3 w-3" /> Eliminar del equipo
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}

                            {members.length < 5 && (
                                <button onClick={addMember}
                                    className="w-full glass rounded-xl border-border border-dashed p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all font-sans text-sm">
                                    <Plus className="h-4 w-4" /> Agregar Integrante ({members.length}/5)
                                </button>
                            )}
                        </div>

                        {/* Análisis */}
                        {canAnalyze && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <Button onClick={() => setShowAnalysis(!showAnalysis)} className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                    <Sparkles className="h-4 w-4" />
                                    {showAnalysis ? "Ocultar Análisis" : "Ver Análisis de Compatibilidad"}
                                </Button>

                                <AnimatePresence>
                                    {showAnalysis && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                            className="glass rounded-2xl p-6 border-indigo-500/20 bg-indigo-500/5 space-y-6">
                                            <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-indigo-400" /> Mapa de Energías del Equipo
                                            </h3>

                                            {/* Cards de cada miembro */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {members.map(m => m.life_path && (
                                                    <div key={m.id} className="p-3 rounded-lg bg-background/50 border border-border text-center">
                                                        <p className="text-xs text-muted-foreground mb-1 truncate">{m.name}</p>
                                                        <p className="text-2xl font-serif font-bold text-primary">{m.life_path}</p>
                                                        <p className="text-[10px] text-foreground/60 mt-0.5">{lifePathTraits[m.life_path]?.energy}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Dinámicas cruzadas */}
                                            <div>
                                                <h4 className="text-sm font-serif font-semibold text-foreground mb-3">Dinámicas Entre Integrantes</h4>
                                                <div className="space-y-2">
                                                    {members.flatMap((m1, i) =>
                                                        members.slice(i + 1).map(m2 => m1.life_path && m2.life_path ? (
                                                            <div key={`${m1.id}-${m2.id}`} className="p-3 rounded-lg bg-background/40 border border-border/50">
                                                                <p className="text-xs font-bold text-foreground mb-0.5">
                                                                    {m1.name.split(" ")[0]} ↔ {m2.name.split(" ")[0]}
                                                                    <span className="text-muted-foreground font-normal ml-2">{m1.life_path} + {m2.life_path}</span>
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{getCompatibility(m1.life_path!, m2.life_path!)}</p>
                                                            </div>
                                                        ) : null)
                                                    )}
                                                </div>
                                            </div>

                                            {/* Suma vibratoria colectiva — con significado explicado */}
                                            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                                        <span className="text-xl font-serif font-bold text-indigo-300">{collectiveNumber}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-serif font-semibold text-indigo-300">Vibración Colectiva del Equipo</h4>
                                                        <p className="text-xs text-muted-foreground">Número {collectiveNumber} — {lifePathTraits[collectiveNumber]?.energy || "Energía Única"}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-foreground/80 font-sans leading-relaxed mb-3">
                                                    {collectiveNumberMeaning[collectiveNumber] || "Este equipo proyecta una vibración única que combina todas sus energías individuales en un propósito singular."}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="p-2 rounded-lg bg-background/40 border border-border/40">
                                                        <p className="text-muted-foreground mb-0.5">Fortaleza colectiva</p>
                                                        <p className="text-foreground font-semibold">{lifePathTraits[collectiveNumber]?.strength || "—"}</p>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-background/40 border border-border/40">
                                                        <p className="text-muted-foreground mb-0.5">Punto de atención</p>
                                                        <p className="text-foreground font-semibold">{lifePathTraits[collectiveNumber]?.shadow || "—"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button onClick={handleSave} disabled={isSaving} variant="outline" className="flex-1 gap-2">
                                                    <Save className="h-4 w-4" />
                                                    {isSaving ? "Guardando..." : "Guardar en Mi Evolución"}
                                                </Button>
                                                <Button onClick={() => { setShowAnalysis(false); setExpandedMember(null); }} variant="ghost" className="gap-2">
                                                    <RefreshCw className="h-4 w-4" /> Editar
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </motion.div>
                </ProFeatureGate>
            </div>
        </div>
    );
};

export default RadarEquipo;
