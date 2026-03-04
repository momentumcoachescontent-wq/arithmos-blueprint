import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Users, Plus, Trash2, ArrowLeft, Sparkles, Zap,
    ChevronDown, ChevronUp, RefreshCw, Save
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProFeatureGate } from "@/components/ProFeatureGate";

// ─── Numerología Básica ────────────────────────────────
function reduceNumber(n: number): number {
    if (n === 11 || n === 22 || n === 33) return n; // Números maestros
    if (n <= 9) return n;
    return reduceNumber(String(n).split("").reduce((a, d) => a + parseInt(d), 0));
}

function getLifePath(birthDate: string): number {
    const digits = birthDate.replace(/-/g, "").split("").map(Number);
    return reduceNumber(digits.reduce((a, b) => a + b, 0));
}

const lifePathTraits: Record<number, { strength: string; shadow: string; energy: string }> = {
    1: { strength: "Liderazgo e iniciativa", shadow: "Egocentrismo", energy: "Pionero" },
    2: { strength: "Diplomacia y empatía", shadow: "Indecisión", energy: "Mediador" },
    3: { strength: "Creatividad y expresión", shadow: "Superficialidad", energy: "Creativo" },
    4: { strength: "Estructura y disciplina", shadow: "Rigidez", energy: "Constructor" },
    5: { strength: "Adaptabilidad y libertad", shadow: "Dispersión", energy: "Explorador" },
    6: { strength: "Cuidado y responsabilidad", shadow: "Perfeccionismo", energy: "Protector" },
    7: { strength: "Análisis y profundidad", shadow: "Aislamiento", energy: "Sabio" },
    8: { strength: "Poder y abundancia", shadow: "Autoritarismo", energy: "Ejecutor" },
    9: { strength: "Humanismo y visión global", shadow: "Sacrificio excesivo", energy: "Visionario" },
    11: { strength: "Intuición y revelación", shadow: "Ansiedad", energy: "Iluminador" },
    22: { strength: "Maestría y manifestación", shadow: "Presión extrema", energy: "Arquitecto" },
    33: { strength: "Servicio y amor incondicional", shadow: "Martirologio", energy: "Maestro" },
};

function getCompatibility(a: number, b: number): string {
    const diff = Math.abs(a - b);
    if (diff === 0) return "Espejo perfecto — gran potencial, también gran tensión";
    if ([1, 2].includes(diff)) return "Alta compatibilidad — fluyen naturalmente";
    if ([3, 4].includes(diff)) return "Complementarios — se nutren mutuamente";
    return "Energías contrastantes — requieren comunicación consciente";
}

interface TeamMember {
    id: string;
    name: string;
    birth_date: string;
    life_path: number | null;
}

// ─── Componente Principal ─────────────────────────────
const RadarEquipo = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile } = useProfile();
    const [title, setTitle] = useState("Mi Equipo");
    const [members, setMembers] = useState<TeamMember[]>([
        { id: "1", name: "", birth_date: "", life_path: null },
        { id: "2", name: "", birth_date: "", life_path: null },
    ]);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedMember, setExpandedMember] = useState<string | null>(null);

    const addMember = () => {
        if (members.length >= 5) {
            toast.error("Máximo 5 integrantes por equipo.");
            return;
        }
        setMembers(prev => [...prev, {
            id: Date.now().toString(), name: "", birth_date: "", life_path: null
        }]);
    };

    const removeMember = (id: string) => {
        if (members.length <= 2) { toast.error("Mínimo 2 integrantes."); return; }
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const updateMember = (id: string, field: keyof TeamMember, value: string) => {
        setMembers(prev => prev.map(m => {
            if (m.id !== id) return m;
            const updated = { ...m, [field]: value };
            if (field === "birth_date" && value.length === 10) {
                updated.life_path = getLifePath(value);
            }
            return updated;
        }));
    };

    const canAnalyze = members.every(m => m.name && m.birth_date && m.life_path);

    const handleSave = async () => {
        if (!user || !canAnalyze) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from("team_readings" as any).insert({
                owner_id: user.id,
                title,
                members: members.map(m => ({ name: m.name, birth_date: m.birth_date, life_path: m.life_path })),
                analysis: `Análisis del equipo ${title} — ${new Date().toLocaleDateString("es-MX")}`,
            });
            if (error) throw error;
            toast.success("Análisis guardado en tu historial.");
        } catch (err: any) {
            toast.error(err.message || "Error al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-background px-6 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-sans font-bold uppercase tracking-widest border border-indigo-500/20">
                        <Users className="h-3 w-3" /> Feature Pro
                    </div>
                </div>

                <ProFeatureGate userRole={profile.role} userId={user?.id || ""} featureName="Radar de Equipo">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-serif font-semibold text-gradient-silver mb-2">Radar de Equipo</h1>
                            <p className="text-muted-foreground font-sans">Analiza la compatibilidad numérica de hasta 5 personas. Descubre las dinámicas de poder, las tensiones latentes y las fortalezas colectivas.</p>
                        </div>

                        {/* Nombre del equipo */}
                        <div className="glass rounded-xl p-6 border-border">
                            <label className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-2 block">Nombre del Equipo</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-transparent text-xl font-serif text-foreground border-b border-border/50 focus:border-primary/50 outline-none pb-2 transition-colors"
                                placeholder="Ej: Equipo de Liderazgo Q2"
                            />
                        </div>

                        {/* Miembros */}
                        <div className="space-y-4">
                            {members.map((member, idx) => (
                                <motion.div key={member.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="glass rounded-xl border-border overflow-hidden">
                                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif font-bold text-sm">
                                                {member.life_path || idx + 1}
                                            </div>
                                            <span className="font-sans font-semibold text-foreground">{member.name || `Integrante ${idx + 1}`}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.life_path && <span className="text-xs text-primary font-bold px-2 py-0.5 bg-primary/10 rounded-full">{lifePathTraits[member.life_path]?.energy || "?"}</span>}
                                            {expandedMember === member.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedMember === member.id && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 border-t border-border/50 pt-4 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-1 block">Nombre</label>
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={e => updateMember(member.id, "name", e.target.value)}
                                                            className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm font-sans text-foreground border border-border/50 focus:border-primary/50 outline-none"
                                                            placeholder="Nombre completo"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-1 block">Fecha de Nacimiento</label>
                                                        <input
                                                            type="date"
                                                            value={member.birth_date}
                                                            onChange={e => updateMember(member.id, "birth_date", e.target.value)}
                                                            className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm font-sans text-foreground border border-border/50 focus:border-primary/50 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                {member.life_path && (
                                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                                        <p className="text-xs font-sans text-muted-foreground">Camino de Vida <strong className="text-primary">{member.life_path}</strong> — {lifePathTraits[member.life_path]?.strength || "Energía única"}</p>
                                                        <p className="text-xs text-muted-foreground/70 mt-1">Sombra: {lifePathTraits[member.life_path]?.shadow || "—"}</p>
                                                    </div>
                                                )}
                                                {members.length > 2 && (
                                                    <button onClick={() => removeMember(member.id)} className="flex items-center gap-1.5 text-rose-500 text-xs font-sans hover:text-rose-400 transition-colors">
                                                        <Trash2 className="h-3 w-3" /> Eliminar
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}

                            {members.length < 5 && (
                                <button onClick={addMember} className="w-full glass rounded-xl border-border border-dashed p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all font-sans text-sm">
                                    <Plus className="h-4 w-4" /> Agregar Integrante ({members.length}/5)
                                </button>
                            )}
                        </div>

                        {/* Análisis */}
                        {canAnalyze && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <Button onClick={() => setShowAnalysis(!showAnalysis)} className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                    <Sparkles className="h-4 w-4" />
                                    {showAnalysis ? "Ocultar Análisis" : "Ver Análisis de Compatibilidad"}
                                </Button>

                                <AnimatePresence>
                                    {showAnalysis && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass rounded-2xl p-6 border-indigo-500/20 bg-indigo-500/5 space-y-6">
                                            <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-indigo-400" /> Mapa de Energías del Equipo
                                            </h3>

                                            {/* Tabla de paths */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {members.map(m => m.life_path && (
                                                    <div key={m.id} className="p-3 rounded-lg bg-background/50 border border-border">
                                                        <p className="text-xs text-muted-foreground">{m.name}</p>
                                                        <p className="text-2xl font-serif font-bold text-primary">{m.life_path}</p>
                                                        <p className="text-xs text-foreground/70 mt-1">{lifePathTraits[m.life_path]?.strength}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Compatibilidades cruzadas */}
                                            <div>
                                                <h4 className="text-sm font-serif font-semibold text-foreground mb-3">Dinámicas Entre Integrantes</h4>
                                                <div className="space-y-2">
                                                    {members.flatMap((m1, i) =>
                                                        members.slice(i + 1).map(m2 => m1.life_path && m2.life_path ? (
                                                            <div key={`${m1.id}-${m2.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/50 text-sm font-sans">
                                                                <span className="font-bold text-primary shrink-0">{m1.name.split(" ")[0]} + {m2.name.split(" ")[0]}</span>
                                                                <span className="text-muted-foreground text-xs">{getCompatibility(m1.life_path!, m2.life_path!)}</span>
                                                            </div>
                                                        ) : null)
                                                    )}
                                                </div>
                                            </div>

                                            {/* Recomendación general */}
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                                <h4 className="text-sm font-serif font-semibold text-indigo-300 mb-2">Recomendación Estratégica</h4>
                                                <p className="text-sm text-foreground/80 font-sans leading-relaxed">
                                                    Este equipo tiene una suma vibratoria colectiva de <strong className="text-primary">{reduceNumber(members.reduce((a, m) => a + (m.life_path || 0), 0))}</strong>.
                                                    Aprovecha las energías dominantes para asignar roles que alineen con la naturaleza numerológica de cada integrante.
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button onClick={handleSave} disabled={isSaving} variant="outline" className="flex-1 gap-2">
                                                    <Save className="h-4 w-4" />
                                                    {isSaving ? "Guardando..." : "Guardar en Historial"}
                                                </Button>
                                                <Button onClick={() => setShowAnalysis(false)} variant="ghost" className="gap-2">
                                                    <RefreshCw className="h-4 w-4" /> Editar equipo
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
