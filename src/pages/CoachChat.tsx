import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCoachSession } from "@/hooks/useCoachSession";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles, AlertCircle, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CoachChat = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
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

        // Return focus to input if possible
        textareaRef.current?.focus();

        await sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

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
                            <p className="text-xs text-muted-foreground font-sans">
                                {isStreaming ? "Conectando con tu frecuencia..." : "Conversaciones Honestas"}
                            </p>
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
                        placeholder="Habla desde la sombra..."
                        className="min-h-[60px] max-h-[160px] bg-secondary border-border font-sans resize-none py-4 px-5 rounded-2xl pr-14 focus:ring-primary/20"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isStreaming || isLoading}
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
