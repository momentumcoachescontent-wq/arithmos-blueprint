import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Trash2, Eye, X, Book, Sparkles, Users,
    History, PenLine, Filter, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────
type EntryType = "all" | "journal_entry" | "team_reading" | "reading" | "mission";

interface EvolucionEntry {
    id: string;
    title: string;
    type: EntryType;
    date: string;
    content?: string;
    preview?: string;
    analysisData?: any;
    source: "journal_entries" | "team_readings" | "readings";
}

const TYPE_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    journal_entry: { label: "Diario", icon: Book, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    team_reading: { label: "Radar Equipo", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    reading: { label: "Lectura", icon: Sparkles, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    mission: { label: "Actividad", icon: History, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

// ─── Componente ───────────────────────────────────────
const Evolucion = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [entries, setEntries] = useState<EvolucionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<EntryType>("all");
    const [viewing, setViewing] = useState<EvolucionEntry | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EvolucionEntry | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) navigate("/onboarding");
    }, [isAuthenticated, navigate]);

    const fetchAll = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [journalRes, teamRes, readingsRes] = await Promise.all([
                supabase
                    .from("journal_entries")
                    .select("id, title, content, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(50),
                supabase
                    .from("team_readings" as any)
                    .select("id, title, members, analysis, created_at")
                    .eq("owner_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(50),
                supabase
                    .from("readings")
                    .select("id, title, type, metadata, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(50),
            ]);

            const combined: EvolucionEntry[] = [
                ...(journalRes.data || []).map((j: any) => ({
                    id: j.id,
                    title: j.title || "Entrada de Diario",
                    type: "journal_entry" as EntryType,
                    date: j.created_at,
                    content: j.content,
                    preview: j.content?.substring(0, 120),
                    source: "journal_entries" as const,
                })),
                ...((teamRes.data as any[]) || []).map((t: any) => ({
                    id: t.id,
                    title: `Radar: ${t.title}`,
                    type: "team_reading" as EntryType,
                    date: t.created_at,
                    content: "",
                    analysisData: { members: t.members, analysis: t.analysis },
                    preview: `${(t.members as any[]).length} integrantes — ${(t.members as any[]).map((m: any) => m.name).join(", ")}`,
                    source: "team_readings" as const,
                })),
                ...(readingsRes.data || []).map((r: any) => ({
                    id: r.id,
                    title: r.title,
                    type: (r.type === "mission" ? "mission" : "reading") as EntryType,
                    date: r.created_at,
                    preview: r.metadata?.summary || r.metadata?.description || "",
                    source: "readings" as const,
                })),
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setEntries(combined);
        } catch (err) {
            console.error(err);
            toast.error("Error al cargar el historial.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Eliminar ──
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            let error: any = null;
            if (deleteTarget.source === "journal_entries") {
                ({ error } = await supabase.from("journal_entries").delete().eq("id", deleteTarget.id));
            } else if (deleteTarget.source === "team_readings") {
                ({ error } = await supabase.from("team_readings" as any).delete().eq("id", deleteTarget.id));
            } else {
                ({ error } = await supabase.from("readings").delete().eq("id", deleteTarget.id));
            }
            if (error) throw error;
            setEntries(prev => prev.filter(e => e.id !== deleteTarget.id));
            toast.success("Entrada eliminada.");
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err.message || "Error al eliminar.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = filter === "all" ? entries : entries.filter(e => e.type === filter);
    const counts = {
        all: entries.length,
        journal_entry: entries.filter(e => e.type === "journal_entry").length,
        team_reading: entries.filter(e => e.type === "team_reading").length,
        reading: entries.filter(e => e.type === "reading").length,
        mission: entries.filter(e => e.type === "mission").length,
    };

    return (
        <CosmicShell particles particlePalette="emerald">
            <div className="min-h-screen pb-32 overflow-y-auto no-scrollbar">
                {/* Header */}
                <header className="border-b border-white/10 px-6 py-4 sticky top-0 bg-black/40 backdrop-blur-md z-10">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <button 
                            onClick={() => navigate("/dashboard")} 
                            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-sans"
                        >
                            <ArrowLeft className="h-4 w-4" /> Dashboard
                        </button>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => navigate("/journal")} 
                            className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-2"
                        >
                            <PenLine className="h-3.5 w-3.5" /> Nueva Entrada
                        </Button>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto px-6 py-10">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--cosm-font-display)" }}>Tu Evolución</h1>
                        <p className="text-sm text-white/40 font-sans mb-8">
                            {entries.length} registros en total — diario, lecturas, actividades y análisis de equipo.
                        </p>
                    </motion.div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {(["all", "journal_entry", "reading", "mission", "team_reading"] as EntryType[]).map(f => {
                            const meta = f === "all" ? null : TYPE_META[f];
                            const Icon = meta?.icon;
                            const isSelected = filter === f;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isSelected
                                        ? (f === "all" ? "bg-white text-black border-transparent" : `${meta?.bg} ${meta?.color} border-current`)
                                        : "bg-white/5 text-white/30 border-white/5 hover:border-white/20 hover:text-white/60"
                                        }`}
                                >
                                    {Icon && <Icon className="h-3 w-3" />}
                                    {f === "all" ? "Todo" : meta?.label}
                                    <span className={`${isSelected ? "opacity-70" : "opacity-30"} ml-1`}>
                                        {counts[f] > 0 && counts[f]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Lista */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 cosmic-card bg-white/5 animate-pulse" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <History className="h-10 w-10 text-white/10 mx-auto mb-4" />
                            <p className="text-white/30 font-sans text-xs uppercase tracking-widest">Sin registros en esta categoría</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence initial={false}>
                                {filtered.map(entry => {
                                    const meta = TYPE_META[entry.type] || TYPE_META["reading"];
                                    const Icon = meta.icon;
                                    return (
                                        <motion.div
                                            key={entry.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="cosmic-card p-5 flex items-start gap-4 group hover:bg-white/[0.04] transition-all relative overflow-hidden"
                                        >
                                            {/* Icono tipo */}
                                            <div className={`p-3 rounded-2xl ${meta.bg} border shrink-0`}>
                                                <Icon className={`h-5 w-5 ${meta.color}`} />
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">
                                                            {meta.label} · {format(new Date(entry.date), "d MMM yyyy", { locale: es })}
                                                        </p>
                                                        <h3 className="text-lg font-bold text-white/90 truncate leading-tight mb-1" style={{ fontFamily: "var(--cosm-font-display)" }}>
                                                            {entry.title}
                                                        </h3>
                                                        {entry.preview && (
                                                            <p className="text-xs text-white/40 font-sans line-clamp-2 leading-relaxed italic">
                                                                "{entry.preview}..."
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Acciones */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {entry.content && (
                                                            <button 
                                                                onClick={() => setViewing(entry)} 
                                                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setDeleteTarget(entry)} 
                                                            className="w-10 h-10 rounded-xl bg-red-500/5 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Modal Ver Entrada */}
                <AnimatePresence>
                    {viewing && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6"
                            onClick={() => setViewing(null)}
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 20 }} 
                                animate={{ scale: 1, y: 0 }} 
                                exit={{ scale: 0.95, y: 20 }}
                                className="cosmic-card p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto no-scrollbar bg-black/40 border-white/20 shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)]"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
                                    <div>
                                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] mb-2">
                                            {TYPE_META[viewing.type]?.label} · {format(new Date(viewing.date), "PPP", { locale: es })}
                                        </p>
                                        <h2 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: "var(--cosm-font-display)" }}>
                                            {viewing.title}
                                        </h2>
                                    </div>
                                    <button 
                                        onClick={() => setViewing(null)} 
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                
                                {viewing.type === "team_reading" && viewing.analysisData ? (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
                                                <Users className="h-4 w-4" /> Perfiles Analizados
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {viewing.analysisData.members.map((m: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <span className="text-sm font-bold text-white/80">{m.name}</span>
                                                        <span className="text-[10px] font-black bg-indigo-500 text-white px-3 py-1 rounded-full uppercase">CP {m.life_path}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(viewing.analysisData.analysis);
                                                return parsed.collective ? (
                                                    <div className="p-8 bg-black/40 rounded-3xl border border-white/10 flex items-center gap-6 shadow-inner">
                                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-2xl">
                                                            <span className="text-4xl font-bold text-white" style={{ fontFamily: "var(--cosm-font-display)" }}>{parsed.collective}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "var(--cosm-font-display)" }}>Propósito de Sinergia</h3>
                                                            <p className="text-sm text-white/40 font-sans italic">Frecuencia unificada de la tríada o equipo analizado.</p>
                                                        </div>
                                                    </div>
                                                ) : null;
                                            } catch (e) { return null; }
                                        })()}
                                    </div>
                                ) : (
                                    <p className="text-lg font-sans text-white/80 leading-relaxed whitespace-pre-wrap italic opacity-90 border-l-2 border-emerald-500/50 pl-6 py-2">
                                        {viewing.content}
                                    </p>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal Confirmar Eliminar */}
                <AnimatePresence>
                    {deleteTarget && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-6"
                            onClick={() => !isDeleting && setDeleteTarget(null)}
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 10 }} 
                                animate={{ scale: 1, y: 0 }} 
                                exit={{ scale: 0.95 }}
                                className="cosmic-card p-8 max-w-sm w-full border-red-500/20 text-center"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--cosm-font-display)" }}>Borrar Memoria</h3>
                                <p className="text-sm text-white/40 font-sans mb-8">
                                    ¿Confirmas la eliminación permanente de <span className="text-white/80 font-bold">"{deleteTarget.title}"</span>? Esta acción no se puede revertir.
                                </p>
                                <div className="space-y-3">
                                    <Button 
                                        onClick={handleDelete} 
                                        disabled={isDeleting}
                                        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        {isDeleting ? "Desintegrando..." : "Sí, eliminar"}
                                    </Button>
                                    <Button 
                                        onClick={() => setDeleteTarget(null)} 
                                        disabled={isDeleting} 
                                        variant="ghost" 
                                        className="w-full h-12 text-white/30 hover:text-white uppercase tracking-widest text-[10px]"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </CosmicShell>
    );
    );
};

export default Evolucion;
