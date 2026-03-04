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
                    content: `${(t.members as any[]).length} integrantes analizados.`,
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border px-6 py-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Dashboard
                    </button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/journal")} className="font-sans text-xs gap-1.5">
                        <PenLine className="h-3.5 w-3.5" /> Nueva Entrada
                    </Button>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-serif font-semibold text-foreground mb-1">Tu Evolución</h1>
                <p className="text-sm text-muted-foreground font-sans mb-6">{entries.length} registros en total — diario, lecturas, actividades y análisis de equipo.</p>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {(["all", "journal_entry", "reading", "mission", "team_reading"] as EntryType[]).map(f => {
                        const meta = f === "all" ? null : TYPE_META[f];
                        const Icon = meta?.icon;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all ${filter === f
                                        ? (f === "all" ? "bg-foreground text-background border-transparent" : `${meta?.bg} ${meta?.color} border-current`)
                                        : "bg-secondary/40 text-muted-foreground border-border hover:border-muted-foreground/40"
                                    }`}
                            >
                                {Icon && <Icon className="h-3 w-3" />}
                                {f === "all" ? "Todo" : meta?.label}
                                <span className={`${filter === f ? "opacity-70" : "opacity-50"} ml-0.5`}>
                                    {counts[f] > 0 && counts[f]}
                                </span>
                            </button>
                        );
                    })}
                    <Filter className={`h-4 w-4 self-center ml-auto ${filter !== "all" ? "text-primary" : "text-muted-foreground/40"}`} />
                </div>

                {/* Lista */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 glass rounded-xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-sans text-sm">Sin registros en esta categoría.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence initial={false}>
                            {filtered.map(entry => {
                                const meta = TYPE_META[entry.type] || TYPE_META["reading"];
                                const Icon = meta.icon;
                                return (
                                    <motion.div
                                        key={entry.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                                        className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 group hover:border-primary/20 transition-all"
                                    >
                                        {/* Icono tipo */}
                                        <div className={`p-2 rounded-lg ${meta.bg} border shrink-0 mt-0.5`}>
                                            <Icon className={`h-4 w-4 ${meta.color}`} />
                                        </div>

                                        {/* Contenido */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-0.5">
                                                        {meta.label} · {format(new Date(entry.date), "d MMM yyyy", { locale: es })}
                                                    </p>
                                                    <h3 className="text-sm font-serif font-semibold text-foreground truncate">{entry.title}</h3>
                                                    {entry.preview && (
                                                        <p className="text-xs text-muted-foreground font-sans mt-1 line-clamp-2">{entry.preview}</p>
                                                    )}
                                                </div>

                                                {/* Acciones — siempre visibles en móvil, hover en desktop */}
                                                <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {entry.content && (
                                                        <button onClick={() => setViewing(entry)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => setDeleteTarget(entry)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setViewing(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-card border border-border rounded-xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-sans mb-1">
                                        {TYPE_META[viewing.type]?.label} · {format(new Date(viewing.date), "PPP", { locale: es })}
                                    </p>
                                    <h2 className="text-xl font-serif font-semibold text-foreground">{viewing.title}</h2>
                                </div>
                                <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm font-sans text-foreground/85 leading-relaxed whitespace-pre-wrap">{viewing.content}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Confirmar Eliminar */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => !isDeleting && setDeleteTarget(null)}>
                        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="bg-card border border-destructive/20 rounded-xl p-6 max-w-sm w-full"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-destructive/10">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <h3 className="font-serif font-semibold text-foreground">Eliminar Entrada</h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-sans mb-1">¿Eliminar permanentemente?</p>
                            <p className="text-sm font-serif text-foreground mb-6 font-semibold">"{deleteTarget.title}"</p>
                            <div className="flex gap-3">
                                <Button onClick={handleDelete} disabled={isDeleting}
                                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                                </Button>
                                <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting} variant="outline" className="flex-1">
                                    Cancelar
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Evolucion;
