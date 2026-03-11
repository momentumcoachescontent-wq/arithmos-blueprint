import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCoachSession } from "@/hooks/useCoachSession";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles, Save, Lock, Zap, Eye } from "lucide-react";
import { motion } from "framer-motion";

const ShadowGate = ({ onUpgrade }: { onUpgrade: () => void }) => (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-rose-950/10 to-background pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <header className="border-b border-border px-6 py-4 flex-none bg-background/80 backdrop-blur-md z-10 sticky top-0">
            <div className="max-w-3xl mx-auto flex items-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-rose-400" />
                        Coach de Sombras
                    </h1>
                    <p className="text-xs text-muted-foreground font-sans">Acceso Exclusivo Premium</p>
                </div>
            </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-lg w-full text-center space-y-8"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                            <Lock className="h-10 w-10 text-rose-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-amber-400" />
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-serif font-semibold text-foreground">
                        Tu sombra requiere<br />
                        <span className="text-rose-400">valentía real.</span>
                    </h2>
                    <p className="text-muted-foreground font-sans leading-relaxed">
                        El Coach de Sombras es el espacio donde se trabaja la oscuridad más profunda. La integración táctica del miedo, el trauma y los patterns inconscientes que te frenan.
                    </p>
                    <p className="text-sm text-muted-foreground/70 font-sans italic">
                        Esta herramienta solo está disponible para miembros Premium de Arithmos.
                    </p>
                </div>

                <div className="glass rounded-2xl p-6 border-rose-500/10 text-left space-y-3">
                    <p className="text-xs font-sans font-bold uppercase tracking-widest text-rose-400 mb-4">Al desbloquear acceso Premium:</p>
                    {[
                        { icon: Eye, text: "Coach IA con tono de psicología post-traumática" },
                        { icon: Sparkles, text: "Memoria persistente de tus sesiones de sombra" },
                        { icon: Zap, text: "Transcripciones automáticas en tu Diario Evolutivo" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                                <item.icon className="h-4 w-4 text-rose-400" />
                            </div>
                            <p className="text-sm font-sans text-foreground/80">{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={onUpgrade}
                        className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border-0 gap-2"
                    >
                        <Zap className="h-5 w-5" />
                        Desbloquear Coach de Sombras
                    </Button>
                    <p className="text-xs text-muted-foreground font-sans">
                        Acceso completo a todas las herramientas Premium de Arithmos
                    </p>
                </div>
            </motion.div>
        </main>
    </div>
);

const CoachChat = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { profile } = useProfile();
    const {
        messages,
        sendMessage,
        isStreaming,
        isLoading,
        endSession
    } = useCoachSession();

    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Protección de ruta
    useEffect(() => {
        if (!isAuthenticated) navigate("/onboarding");
    }, [isAuthenticated, navigate]);

    // Auto-scroll al fondo cuando hay nuevos mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isStreaming) return;
        const text = inputValue.trim();
        setInputValue("");
        textareaRef.current?.focus();
        await sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const isLimitReached = userMessageCount >= 5;

    // Disparar endSession automáticamente cuando el asistente termine de responder el 5to mensaje
    useEffect(() => {
        if (isLimitReached && !isStreaming && !isLoading && messages[messages.length - 1]?.role === 'assistant') {
            const hasDraftSummary = messages.some(m => m.content.includes("Sesión concluida")); // Evitar loops
            if (!hasDraftSummary) {
                endSession();
            }
        }
    }, [isLimitReached, isStreaming, isLoading, messages, endSession]);

    // Paywall premium — muestra Shadow Gate a usuarios freemium
    const isPremium = profile?.role === 'premium' || profile?.role === 'admin';
    if (profile && !isPremium) {
        return <ShadowGate onUpgrade={() => navigate('/dashboard')} />;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Cabecera */}
            <header className="border-b border-border px-6 py-4 flex-none bg-background/80 backdrop-blur-md z-10 sticky top-0">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Coach de Sombras
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground font-sans">
                                    {isStreaming ? "Conectando con tu frecuencia..." : "Conversaciones Honestas"}
                                </p>
                                {userMessageCount > 0 && (
                                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                        {Math.min(userMessageCount, 5)} / 5
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {messages.filter(m => m.role !== 'system').length > 1 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={endSession}
                            disabled={isLoading}
                            className="font-sans text-xs border-primary/20 hover:bg-primary/10"
                        >
                            <Save className="h-3.5 w-3.5 mr-2" />
                            Terminar & Resumir
                        </Button>
                    )}
                </div>
            </header>

            {/* Área de Mensajes */}
            <main className="flex-1 overflow-y-auto px-4 py-8">
                <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">

                    {messages.filter(m => m.role !== 'system').length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center my-auto py-12"
                        >
                            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                                <Sparkles className="h-8 w-8 text-primary opacity-80" />
                            </div>
                            <h2 className="text-2xl font-serif text-foreground mb-3">Tu refugio estratégico.</h2>
                            <p className="text-muted-foreground font-sans max-w-md leading-relaxed mb-8">
                                Estoy aquí para ayudarte a confrontar tus bloqueos, entender tu vibración de sombra y transformar el caos en código ordenado.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                <button onClick={() => setInputValue("Siento que estoy repitiendo un patrón tóxico...")} className="p-4 text-left rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all font-sans text-sm text-foreground/80">
                                    "Siento que estoy repitiendo un patrón tóxico..."
                                </button>
                                <button onClick={() => setInputValue("Quiero entender mejor cómo mi número personal influye en mi bloqueo actual.")} className="p-4 text-left rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all font-sans text-sm text-foreground/80">
                                    "Quiero entender mi bloqueo desde mi número..."
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-2">
                            {messages.map(msg => (
                                <ChatMessage key={msg.id} message={msg} />
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </main>

            {/* Input Footer */}
            <footer className="px-4 py-4 bg-background/80 backdrop-blur-md border-t border-border flex-none">
                <div className="max-w-3xl mx-auto flex gap-3 items-end relative">
                    <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isLimitReached ? "Sesión concluida. Tu diario está siendo actualizado." : "Habla desde la sombra..."}
                        className="min-h-[60px] max-h-[160px] bg-secondary border-border font-sans resize-none py-4 px-5 rounded-2xl pr-14 focus:ring-primary/20"
                        disabled={isLoading || isLimitReached}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isStreaming || isLoading || isLimitReached}
                        className="absolute right-2 bottom-2 h-11 w-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
                    >
                        <Send className="h-5 w-5 ml-1" />
                    </Button>
                </div>
            </footer>
        </div>
    );
};

export default CoachChat;
