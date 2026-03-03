import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Zap, Shield } from "lucide-react";

interface TacticalRecommendationsProps {
    birthDate: string;
    lifePathNumber: number;
}

function reduceToSingleDigitOrMaster(num: number): number {
    const masters = [11, 22, 33];
    let current = num;
    while (current > 9 && !masters.includes(current)) {
        const digits = current.toString().split("").map(Number);
        current = digits.reduce((a, b) => a + b, 0);
    }
    return current;
}

function getTodayPersonalDay(birthDate: string): number {
    const today = new Date();
    const [, birthMonth, birthDay] = birthDate.split("-").map(Number);
    const raw = today.getDate() + today.getMonth() + 1 + birthDay + birthMonth;
    return reduceToSingleDigitOrMaster(raw);
}

const DAILY_TACTICS: Record<number, string[]> = {
    1: ["Define un objetivo claro para las próximas 24 horas.", "Inicia esa conversación difícil que has pospuesto.", "Haz algo de forma totalmente independiente."],
    2: ["Busca la opinión de un aliado confiable antes de decidir.", "Practica la escucha activa en todas tus reuniones.", "Evita el conflicto directo; busca la diplomacia."],
    3: ["Escribe o comunica tus ideas de forma creativa.", "Conecta con alguien fuera de tu círculo habitual.", "Usa el humor para suavizar una tensión."],
    4: ["Organiza tu espacio de trabajo físico o digital.", "Sigue tu rutina al pie de la letra hoy.", "Finaliza una tarea técnica pendiente."],
    5: ["Cambia tu ruta habitual o prueba algo nuevo.", "Sé flexible ante interrupciones imprevistas.", "Busca una oportunidad en medio del cambio."],
    6: ["Dedica tiempo a fortalecer un vínculo familiar o de equipo.", "Armoniza un ambiente que sientas tenso.", "Asume una responsabilidad con compromiso total."],
    7: ["Dedica 15 minutos a la meditación o reflexión profunda.", "Analiza los datos antes de emitir un juicio.", "Desconéctate de las redes sociales por unas horas."],
    8: ["Revisa tus finanzas o recursos estratégicos.", "Toma una posición de autoridad en un asunto clave.", "Negocia desde una postura de ganar-ganar."],
    9: ["Suelta un hábito o tarea que ya no te aporta valor.", "Ayuda a alguien sin esperar nada a cambio.", "Cierra un ciclo pendiente hoy."],
    11: ["Confía plenamente en tu primera corazonada hoy.", "Comparte una visión inspiradora con otros.", "Observa los números y señales a tu alrededor."],
    22: ["Planifica algo que tenga impacto a largo plazo.", "Coordina un esfuerzo grupal hacia una meta grande.", "Construye una estructura sólida para tu proyecto."],
    33: ["Ofrece apoyo emocional a quien lo necesite.", "Lidera con el ejemplo y desde la compasión.", "Cura una vieja herida a través del perdón."],
};

export const TacticalRecommendations = ({ birthDate, lifePathNumber }: TacticalRecommendationsProps) => {
    const dailyNumber = getTodayPersonalDay(birthDate);
    const tactics = DAILY_TACTICS[dailyNumber] || DAILY_TACTICS[1];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 border-border"
        >
            <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <h3 className="font-serif text-lg text-foreground">Acciones Tácticas del Día</h3>
            </div>

            <div className="space-y-4">
                {tactics.map((tactic, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50 border border-border/50 group hover:border-primary/30 transition-all"
                    >
                        <div className="mt-1">
                            {idx === 0 ? <Zap className="h-4 w-4 text-primary" /> :
                                idx === 1 ? <Shield className="h-4 w-4 text-indigo-400" /> :
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                        </div>
                        <p className="text-sm text-foreground/90 font-sans leading-relaxed">
                            {tactic}
                        </p>
                    </motion.div>
                ))}
            </div>

            <p className="text-[10px] text-muted-foreground mt-6 font-sans border-t border-border/30 pt-4">
                * Calibrado según tu frecuencia de <span className="text-primary font-semibold">{dailyNumber}</span> y tu arquetipo de <span className="text-indigo-400 font-semibold">{lifePathNumber}</span>.
            </p>
        </motion.div>
    );
};
