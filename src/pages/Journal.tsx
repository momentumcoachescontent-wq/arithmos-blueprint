import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenLine, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useJournal } from "@/hooks/useJournal";

const Journal = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { entries, isLoading, fetchEntries, createEntry, deleteEntry } = useJournal(user?.id);
    const [isWriting, setIsWriting] = useState(false);
    const [viewing, setViewing] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) { navigate("/onboarding"); return; }
        fetchEntries();
    }, [isAuthenticated, navigate, fetchEntries]);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return;
        setIsSaving(true);
        await createEntry(title.trim(), content.trim());
        setTitle(""); setContent("");
        setIsWriting(false);
        setIsSaving(false);
    };

    const viewedEntry = entries.find(e => e.id === viewing);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Dashboard
                    </button>
                    <Button size="sm" onClick={() => setIsWriting(true)} className="font-sans text-xs">
                        <PenLine className="h-3.5 w-3.5 mr-1.5" /> Nueva Entrada
                    </Button>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">Diario de Sombras</h1>
                <p className="text-sm text-muted-foreground font-sans mb-8">El espacio donde la oscuridad se convierte en claridad estratégica.</p>

                {/* Editor */}
                <AnimatePresence>
                    {isWriting && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 bg-card border border-primary/20 rounded-xl p-6 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/60 to-transparent" />
                            <h2 className="text-sm font-sans font-semibold text-foreground mb-4">Nueva Entrada</h2>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Título de tu reflexión..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-secondary border-border font-sans"
                                />
                                <Textarea
                                    placeholder="Escribe con honestidad. Nadie más que tú puede leer esto. ¿Qué patrón de pensamiento o emoción estás enfrentando hoy?"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="bg-secondary border-border font-sans min-h-[120px] resize-none"
                                />
                                <div className="flex gap-3">
                                    <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()} size="sm" className="font-sans">
                                        {isSaving ? "Guardando..." : "Guardar Entrada"}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setIsWriting(false)} className="font-sans text-muted-foreground">
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Entry List */}
                {isLoading ? (
                    <p className="text-sm text-muted-foreground font-sans">Cargando entradas...</p>
                ) : entries.length === 0 ? (
                    <div className="text-center py-16">
                        <PenLine className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-sans text-sm">Tu diario está en blanco. El primer paso hacia la claridad es nombrarlo.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map((entry) => (
                            <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4 group"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-sans mb-1">
                                        {new Date(entry.createdAt).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                                    </p>
                                    <h3 className="text-sm font-serif font-semibold text-foreground truncate">{entry.title}</h3>
                                    <p className="text-xs text-muted-foreground font-sans mt-1 line-clamp-2">{entry.content}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={() => setViewing(entry.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteEntry(entry.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* View Modal */}
                <AnimatePresence>
                    {viewedEntry && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                            onClick={() => setViewing(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                className="bg-card border border-border rounded-xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-sans mb-1">
                                            {new Date(viewedEntry.createdAt).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                        </p>
                                        <h2 className="text-xl font-serif font-semibold text-foreground">{viewedEntry.title}</h2>
                                    </div>
                                    <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-sm font-sans text-foreground/85 leading-relaxed whitespace-pre-wrap">{viewedEntry.content}</p>
                                {viewedEntry.aiReflection && (
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <p className="text-xs font-sans font-bold text-primary uppercase tracking-wider mb-2">Reflexión del Coach Arithmos</p>
                                        <p className="text-sm font-sans text-foreground/75 leading-relaxed italic">{viewedEntry.aiReflection}</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Journal;
