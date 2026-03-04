import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { CoachMessage } from "@/hooks/useCoachSession";

interface ChatMessageProps {
    message: CoachMessage;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
    const isAssistant = message.role === "assistant";
    const isSystem = message.role === "system";

    if (isSystem) return null; // No mostrar mensajes system en UI

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'} mb-6`}
        >
            <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>

                {/* Avatar */}
                <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isAssistant
                        ? 'bg-primary/20 border border-primary/30 text-primary'
                        : 'bg-muted/30 border border-border text-muted-foreground'
                    }`}>
                    {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Burbuja */}
                <div className={`p-4 rounded-2xl ${isAssistant
                        ? 'bg-card border border-primary/10 text-foreground shadow-sm rounded-tl-sm'
                        : 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-sm'
                    }`}>
                    <p className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">
                        {message.content || (isAssistant ? "..." : "")}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
