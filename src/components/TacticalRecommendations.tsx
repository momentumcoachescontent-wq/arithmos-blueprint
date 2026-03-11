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
    1: [
        "Define un objetivo claro para las próximas 24 horas.", "Inicia esa conversación difícil que has pospuesto.", "Haz algo de forma totalmente independiente.",
        "Lidera una iniciativa en tu círculo cercano.", "Atrévete a probar una herramienta nueva en tu trabajo.", "Da el primer paso en ese proyecto estancado."
    ],
    2: [
        "Busca la opinión de un aliado confiable antes de decidir.", "Practica la escucha activa en todas tus reuniones.", "Evita el conflicto directo; busca la diplomacia.",
        "Fomenta una conexión empática con un colega.", "Colabora en una tarea que requiere precisión en equipo.", "Presta atención a los detalles sutiles en una negociación."
    ],
    3: [
        "Escribe o comunica tus ideas de forma creativa.", "Conecta con alguien fuera de tu círculo habitual.", "Usa el humor para suavizar una tensión.",
        "Expresa una opinión impopular pero innovadora.", "Haz una actividad artística para liberar estrés.", "Lanza esa propuesta que suena demasiado audaz."
    ],
    4: [
        "Organiza tu espacio de trabajo físico o digital.", "Sigue tu rutina al pie de la letra hoy.", "Finaliza una tarea técnica pendiente.",
        "Revisa tus finanzas diarias y recorta fugas.", "Optimiza un proceso que te quita tiempo valioso.", "Crea un sistema o plantilla para tareas repetitivas."
    ],
    5: [
        "Cambia tu ruta habitual o prueba algo nuevo.", "Sé flexible ante interrupciones imprevistas.", "Busca una oportunidad en medio del cambio.",
        "Promueve el networking espontáneo.", "Rompe el guión y actúa instintivamente.", "Acepta un riesgo moderado que acelere tus metas."
    ],
    6: [
        "Dedica tiempo a fortalecer un vínculo familiar o de equipo.", "Armoniza un ambiente que sientas tenso.", "Asume una responsabilidad con compromiso total.",
        "Protege la energía de tu espacio.", "Ofrece mentoría o apoyo a un principiante.", "Mejora el bienestar de tus colaboradores o familia."
    ],
    7: [
        "Dedica 15 minutos a la meditación o reflexión profunda.", "Analiza los datos antes de emitir un juicio.", "Desconéctate de las redes sociales por unas horas.",
        "Cuestiona un dogma que hayas internalizado.", "Investiga a fondo antes de firmar o aceptar.", "Observa el comportamiento de otros en silencio."
    ],
    8: [
        "Revisa tus finanzas o recursos estratégicos.", "Toma una posición de autoridad en un asunto clave.", "Negocia desde una postura de ganar-ganar.",
        "Exige lo que tu trabajo realmente vale.", "Delega inteligentemente para escalar resultados.", "Cierra un acuerdo comercial en pausa."
    ],
    9: [
        "Suelta un hábito o tarea que ya no te aporta valor.", "Ayuda a alguien sin esperar nada a cambio.", "Cierra un ciclo pendiente hoy.",
        "Concluye un proyecto que lleva meses arrastrado.", "Sé generoso con tu conocimiento experto.", "Limpia tus listas de contacto y enfócate en lo vital."
    ],
    11: [
        "Confía plenamente en tu primera corazonada hoy.", "Comparte una visión inspiradora con otros.", "Observa los números y señales a tu alrededor.",
        "Anota tus sueños o visiones, pueden ser presagios lógicos.", "Conecta dos conceptos aparentemente irrelevantes.", "Habla desde la intuición en una junta estratégica."
    ],
    22: [
        "Planifica algo que tenga impacto a largo plazo.", "Coordina un esfuerzo grupal hacia una meta grande.", "Construye una estructura sólida para tu proyecto.",
        "Piensa en un legado que trascienda este año.", "Materializa una idea que sonaba imposible.", "Fija cimientos organizacionales para crecer 10x."
    ],
    33: [
        "Ofrece apoyo emocional a quien lo necesite.", "Lidera con el ejemplo y desde la compasión.", "Cura una vieja herida a través del perdón.",
        "Transforma un ambiente tóxico con pura empatía radical.", "Sana una herida egoica cediendo el reflector.", "Cuida tu propia energía antes de dar a otros."
    ],
};

function getDeterministicTactics(dailyNumber: number): string[] {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    // Simple string hash
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash);

    const pool = DAILY_TACTICS[dailyNumber] || DAILY_TACTICS[1];

    // Select 3 distinct items based on the seed
    const n = pool.length;
    let index1 = seed % n;
    let index2 = (seed + 1) % n;
    let index3 = (seed + 2) % n;

    if (index1 === index2) index2 = (index2 + 1) % n;
    if (index1 === index3 || index2 === index3) index3 = (index3 + 1) % n;

    return [pool[index1], pool[index2], pool[index3]];
}

export const TacticalRecommendations = ({ birthDate, lifePathNumber }: TacticalRecommendationsProps) => {
    const dailyNumber = getTodayPersonalDay(birthDate);
    const tactics = getDeterministicTactics(dailyNumber);

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
