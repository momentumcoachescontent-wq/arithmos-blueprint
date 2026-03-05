import { motion } from "framer-motion";
import { History, Book, Sparkles, ArrowRight, Users, Scale } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useHistory, HistoryItem } from "@/hooks/useHistory";
import { useNavigate } from "react-router-dom";

interface HistorySectionProps {
    userId: string;
}

export const HistorySection = ({ userId }: HistorySectionProps) => {
    const { history, isLoading } = useHistory(userId);
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="glass rounded-xl p-6 animate-pulse">
                <div className="h-6 w-32 bg-secondary rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-secondary rounded"></div>
                    <div className="h-12 bg-secondary rounded"></div>
                </div>
            </div>
        );
    }

    if (history.length === 0) return null;

    const renderIcon = (type: HistoryItem['type']) => {
        switch (type) {
            case 'journal_entry': return <Book className="h-4 w-4 text-amber-400" />;
            case 'daily_pulse': return <Sparkles className="h-4 w-4 text-primary" />;
            case 'team_reading': return <Users className="h-4 w-4 text-indigo-400" />;
            case 'friction_radar': return <Scale className="h-4 w-4 text-indigo-400" />;
            default: return <History className="h-4 w-4 text-indigo-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 border-border"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-serif text-lg text-foreground">Tu Evolución</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground h-8"
                    onClick={() => navigate("/evolucion")}
                >
                    Ver todo <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </div>

            <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/20 transition-all cursor-pointer group"
                        onClick={() => {
                            if (item.type === 'journal_entry') navigate('/journal');
                            else if (item.type === 'team_reading') navigate('/radar-equipo');
                            else if (item.type === 'friction_radar') navigate('/radar-friccion');
                            else navigate('/dashboard');
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-background/50">
                                {renderIcon(item.type)}
                            </div>
                            <div>
                                <p className="text-sm font-sans font-medium text-foreground group-hover:text-primary transition-colors">
                                    {item.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-tighter">
                                    {format(new Date(item.date), "PPP", { locale: es })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
