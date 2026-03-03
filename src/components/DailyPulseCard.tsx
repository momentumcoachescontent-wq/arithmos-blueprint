import { motion } from "framer-motion";
import { Sun } from "lucide-react";

function reduceToSingleDigitOrMaster(num: number): number {
    const masters = [11, 22, 33];
    let current = num;
    while (current > 9 && !masters.includes(current)) {
        const digits = current.toString().split("").map(Number);
        current = digits.reduce((a, b) => a + b, 0);
    }
    return current;
}

function getTodayPersonalDay(birthDate: string): { number: number; message: string } {
    const today = new Date();
    const [, birthMonth, birthDay] = birthDate.split("-").map(Number);
    const raw = today.getDate() + today.getMonth() + 1 + birthDay + birthMonth;
    const dailyNumber = reduceToSingleDigitOrMaster(raw);

    const DAILY_MESSAGES: Record<number, string> = {
        1: "Día de iniciativa. Toma la decisión que has estado evitando. El universo respalda a los que se mueven primero.",
        2: "Día de alianzas. Escucha más de lo que hablas. La respuesta que buscas viene de otro.",
        3: "Día de expresión. Di lo que sientes. Crea. Conecta. Tu voz es tu recurso más subutilizado hoy.",
        4: "Día de estructura. Organiza. Planifica. Los cimientos que pongas hoy sostienen lo que viene.",
        5: "Día de cambio. Acepta lo impredecible. La adaptación es tu ventaja competitiva central hoy.",
        6: "Día de cuidado. Cuida tu entorno más cercano. El amor estratégico amplifica tu impacto.",
        7: "Día de introspección. Retírate del ruido. La respuesta que buscas está dentro, no afuera.",
        8: "Día de poder. Negocia. Decide. Actúa con autoridad. El universo te da luz verde en temas materiales.",
        9: "Día de cierre. Libera lo que ya no funciona. El espacio que creas hoy atrae lo que necesitas.",
        11: "Día maestro de intuición. Confía en los destellos que recibes. Tu percepción está elevada.",
        22: "Día maestro de construcción. Cada acción tiene impacto multiplicado. Actúa con intención.",
        33: "Día maestro de sanación. Tu presencia sana. Ofrece lo mejor de ti sin agotarte.",
    };

    return {
        number: dailyNumber,
        message: DAILY_MESSAGES[dailyNumber] || DAILY_MESSAGES[1],
    };
}

interface DailyPulseCardProps {
    birthDate: string;
}

export function DailyPulseCard({ birthDate }: DailyPulseCardProps) {
    const today = new Date();
    const { number, message } = getTodayPersonalDay(birthDate);
    const isMaster = [11, 22, 33].includes(number);

    const dateStr = today.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 relative overflow-hidden"
        >
            {/* Glow effect for master numbers */}
            {isMaster && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/5 pointer-events-none" />
            )}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-transparent" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sun className="h-4 w-4 text-amber-400" />
                            <span className="text-xs font-sans font-semibold text-amber-400 uppercase tracking-wider">
                                Daily Pulse
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-sans capitalize">{dateStr}</p>
                    </div>
                    <div className="text-center">
                        <div
                            className={`text-3xl font-serif font-bold ${isMaster ? "text-primary" : "text-foreground"}`}
                        >
                            {number}
                        </div>
                        {isMaster && (
                            <span className="text-[10px] text-primary font-sans font-bold uppercase tracking-wider">
                                Maestro
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-sm font-sans text-foreground/80 leading-relaxed">{message}</p>
            </div>
        </motion.div>
    );
}
