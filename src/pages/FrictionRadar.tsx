import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Target,
    ArrowRight,
    ChevronLeft,
    Rocket,
    Scale,
    Zap,
    Ghost,
    Search,
    CheckCircle2,
    AlertCircle,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// --- Types & Constants ---

interface FrictionScores {
    judgment: number;
    certainty: number;
    planning: number;
    emotional: number;
    clarity: number;
}

interface Archetype {
    id: string;
    title: string;
    description: string;
    truth: string;
    protocol: string[];
    anchor: string;
    icon: React.ReactNode;
}

const ARCHETYPES: Record<string, Archetype> = {
    perfeccionista_paralizado: {
        id: "perfeccionista_paralizado",
        title: "El Perfeccionista Paralizado",
        description: "Piensas demasiado y no ejecutas hasta sentirte 'listo'. La presión interna de hacerlo impecable te detiene.",
        truth: "No te falta capacidad, te sobra presión. Tu avance no necesita ser brillante, necesita existir.",
        protocol: [
            "Escribe en una línea qué quieres lograr esta semana.",
            "Haz una lista de 3 versiones imperfectas de cómo podrías empezar.",
            "Dedica 4 minutos a crear un primer borrador feo pero visible."
        ],
        anchor: "Mi primer avance no necesita ser brillante; necesita existir.",
        icon: <Scale className="h-8 w-8 text-amber-500" />
    },
    procrastinador_miedo: {
        id: "procrastinador_miedo",
        title: "El Procrastinador por Miedo",
        description: "Evitas la acción porque anticipas incomodidad o fracaso. La meta se siente como una amenaza.",
        truth: "El miedo no es una señal de stop, es una señal de que lo que haces te importa.",
        protocol: [
            "Nombra el miedo específico: ¿Qué es lo peor que podría pasar?",
            "Divide la tarea en algo que tome menos de 120 segundos.",
            "Comprométete solo a esos 120 segundos hoy."
        ],
        anchor: "Puedo sentir miedo y actuar al mismo tiempo.",
        icon: <Ghost className="h-8 w-8 text-purple-500" />
    },
    buscador_validacion: {
        id: "buscador_validacion",
        title: "El Buscador de Validación",
        description: "La opinión externa pesa más que tu propia intención. Te frenas por el juicio ajeno.",
        truth: "Estás viviendo para la audiencia equivocada. Tu validación debe venir de tu movimiento, no del aplauso.",
        protocol: [
            "Identifica de quién es la voz que más te frena.",
            "Recuerda tu 'Para Qué' original que no depende de nadie.",
            "Haz un movimiento mínimo sin contárselo a nadie por 24 horas."
        ],
        anchor: "Mi meta es mía, no de los demás.",
        icon: <Search className="h-8 w-8 text-blue-500" />
    },
    hiperanalista_exhausto: {
        id: "hiperanalista_exhausto",
        title: "El Hiperanalista Exhausto",
        description: "Tienes demasiadas opciones y te drenas antes de empezar. El análisis te deja sin energía.",
        truth: "La claridad no viene de pensar, viene de hacer. El movimiento es el mejor filtro.",
        protocol: [
            "Elimina todas las opciones menos dos.",
            "Lanza una moneda para decidir (o elige la más rápida).",
            "Ignora el resto de alternativas por hoy."
        ],
        anchor: "Hacer es pensar en voz alta.",
        icon: <Brain className="h-8 w-8 text-indigo-500" />
    },
    saturado_sin_prioridad: {
        id: "saturado_sin_prioridad",
        title: "El Saturado sin Prioridad",
        description: "No estás bloqueado por miedo, sino por dispersión. Haces mucho pero no lo importante.",
        truth: "Si todo es importante, nada lo es. Estás usando el 'estar ocupado' como escudo.",
        protocol: [
            "Elige la UNICA cosa que si hicieras hoy, haría todo lo demás fácil o innecesario.",
            "Bloquea 25 minutos (Pomodoro) solo para esa cosa.",
            "Apaga notificaciones."
        ],
        anchor: "Priorizar es decir 'no' a otras cosas buenas.",
        icon: <Target className="h-8 w-8 text-rose-500" />
    },
    impulsivo_inconsistente: {
        id: "impulsivo_inconsistente",
        title: "El Impulsivo Inconsistente",
        description: "Empiezas con mucha energía pero sin estructura, y te desinflas rápido.",
        truth: "La energía te arranca, pero el sistema te mantiene. Necesitas menos entusiasmo y más estructura.",
        protocol: [
            "Define un disparador diario (Ej: después del café).",
            "Haz el movimiento mínimo por 5 días seguidos, sin importar la intensidad.",
            "Registra cada día con una marca simple."
        ],
        anchor: "La consistencia vence a la intensidad.",
        icon: <Zap className="h-8 w-8 text-yellow-500" />
    },
    protector_ego: {
        id: "protector_ego",
        title: "El Protector del Ego",
        description: "Evitas actuar para no exponerte a 'no ser suficiente'. Si no lo intentas, no fracasas.",
        truth: "Tu valor no está en juego, solo tu aprendizaje. No actuar es el único fracaso real.",
        protocol: [
            "Separa tu identidad de tu resultado (Tú no eres tu proyecto).",
            "Busca activamente un pequeño error hoy para desensibilizarte.",
            "Pide feedback temprano, aunque esté incompleto."
        ],
        anchor: "Estoy aquí para aprender, no para demostrar.",
        icon: <AlertCircle className="h-8 w-8 text-orange-500" />
    },
    ejecutante_dormido: {
        id: "ejecutante_dormido",
        title: "El Ejecutante Dormido",
        description: "Sí puedes actuar, pero te falta el disparador correcto o la urgencia necesaria.",
        truth: "Estás esperando un permiso que ya tienes. No necesitas claridad total para dar el paso 1.",
        protocol: [
            "Crea una fecha límite artificial para hoy a las 6pm.",
            "Comprométete públicamente con una micro-acción.",
            "Simplemente comienza sin calentar."
        ],
        anchor: "Hoy es el día uno, no un día.",
        icon: <Rocket className="h-8 w-8 text-emerald-500" />
    }
};

const SUGGESTED_GOALS = [
    "Empezar mi propio proyecto",
    "Tener una conversación difícil",
    "Hablar en público en el evento",
    "Cerrar una venta importante",
    "Aprobar mi próximo examen",
    "Ir al gimnasio hoy",
];

export default function FrictionRadar() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState("");
    const [scores, setScores] = useState<FrictionScores>({
        judgment: 50,
        certainty: 50,
        planning: 50,
        emotional: 50,
        clarity: 50,
    });
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<Archetype | null>(null);
    const [frictionLevel, setFrictionLevel] = useState<"baja" | "media" | "alta">("media");

    const handleNext = () => {
        if (step === 1 && !goal.trim()) {
            toast.error("Escribe una meta para continuar.");
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const calculateResult = async () => {
        setIsCalculating(true);
        // Artificial delay for UX feel
        await new Promise(r => setTimeout(r, 1500));

        // Scoring Logic
        let archetypeId = "ejecutante_dormido";
        const totalFriction = (scores.judgment + scores.certainty + scores.planning + scores.emotional + (100 - scores.clarity)) / 5;

        const level = totalFriction > 70 ? "alta" : totalFriction > 40 ? "media" : "baja";
        setFrictionLevel(level);

        // Deterministic Mapping
        if (scores.certainty > 70 && scores.planning > 60) {
            archetypeId = "perfeccionista_paralizado";
        } else if (scores.judgment > 70) {
            archetypeId = "buscador_validacion";
        } else if (scores.planning > 70 && scores.clarity < 40) {
            archetypeId = "hiperanalista_exhausto";
        } else if (scores.emotional > 75 && scores.judgment < 40) {
            archetypeId = "procrastinador_miedo";
        } else if (scores.emotional > 60 && scores.clarity < 40) {
            archetypeId = "saturado_sin_prioridad";
        } else if (scores.judgment > 60 && scores.emotional > 60) {
            archetypeId = "protector_ego";
        } else if (scores.planning < 30 && scores.clarity < 40) {
            archetypeId = "impulsivo_inconsistente";
        }

        setResult(ARCHETYPES[archetypeId]);
        setStep(3);
        setIsCalculating(false);

        // Persist to DB if logged in
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await (supabase as any).from('friction_diagnostics').insert({
                    user_id: user.id,
                    goal_text: goal,
                    score_fear_judgment: scores.judgment,
                    score_need_certainty: scores.certainty,
                    score_overplanning: scores.planning,
                    score_emotional_load: scores.emotional,
                    score_clarity_next_step: scores.clarity,
                    profile_id: archetypeId,
                    friction_level: level,
                    steps_completed: 3
                });
            }
        } catch (err) {
            console.error("Error saving diagnostic:", err);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pt-12 pb-24 px-6">
            <div className="max-w-xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase">
                        <Scale className="h-3 w-3" /> Radar de Fricción
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">
                        {step === 3 ? "Tu Perfil de Fricción" : "¿Qué te está frenando hoy?"}
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                        {step === 1 && "Descubre por qué no has empezado y cómo desbloquearte esta semana."}
                        {step === 2 && "Sé honesto contigo mismo. No hay respuestas correctas, solo reales."}
                        {step === 3 && "Este es tu diagnóstico y plan de acción inmediato."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Goal */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Define tu meta actual</Label>
                                <Textarea
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="Ejemplo: Terminar mi propuesta de proyecto..."
                                    className="text-lg py-4 px-5 rounded-2xl bg-secondary/30 border-border focus:ring-primary/20 min-h-[120px] resize-none"
                                />
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {SUGGESTED_GOALS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setGoal(s)}
                                            className="text-[10px] px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleNext} className="w-full h-14 rounded-2xl text-lg font-bold gap-2">
                                Continuar <ArrowRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Sliders */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-10">
                                {[
                                    { id: "judgment" as const, label: "¿Cuánto te frena el juicio ajeno?", left: "Nada", right: "Demasiado", icon: <Search className="h-4 w-4" /> },
                                    { id: "certainty" as const, label: "¿Necesitas certeza total para empezar?", left: "No importa", right: "Imprescindible", icon: <Scale className="h-4 w-4" /> },
                                    { id: "planning" as const, label: "¿Pasas más tiempo planeando que haciendo?", left: "Solo actúo", right: "Hiper-planifico", icon: <Brain className="h-4 w-4" /> },
                                    { id: "emotional" as const, label: "¿Mucha carga emocional o ansiedad?", left: "Paz total", right: "Tensión alta", icon: <AlertCircle className="h-4 w-4" /> },
                                    { id: "clarity" as const, label: "¿Qué tan claro tienes el siguiente paso?", left: "Nulo", right: "Cristalino", icon: <Target className="h-4 w-4" /> },
                                ].map((s) => (
                                    <div key={s.id} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                {s.icon} {s.label}
                                            </Label>
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                                                {scores[s.id] > 70 ? "Alto" : scores[s.id] > 30 ? "Medio" : "Bajo"}
                                            </span>
                                        </div>
                                        <Slider
                                            value={[scores[s.id]]}
                                            onValueChange={([val]) => setScores({ ...scores, [s.id]: val })}
                                            max={100}
                                            step={5}
                                            className="cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                            <span>{s.left}</span>
                                            <span>{s.right}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={handleBack} className="h-14 w-14 rounded-2xl border">
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    onClick={calculateResult}
                                    className="flex-1 h-14 rounded-2xl text-lg font-bold gap-2"
                                    disabled={isCalculating}
                                >
                                    {isCalculating ? "Calculando..." : "Ver Resultados"}
                                    {!isCalculating && <Zap className="h-5 w-5" />}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Result */}
                    {step === 3 && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Archetype Card */}
                            <div className="glass rounded-[32px] p-8 border-primary/20 bg-primary/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    {result.icon}
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
                                            {result.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold text-foreground">{result.title}</h3>
                                            <div className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                                                Fricción {frictionLevel}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-foreground leading-relaxed">
                                        {result.description}
                                    </p>
                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                                        <p className="text-sm font-medium text-primary italic">
                                            "{result.truth}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Protocol */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-serif font-bold flex items-center gap-2">
                                    <Rocket className="h-5 w-5 text-primary" /> Protocolo de Desbloqueo
                                </h4>
                                <div className="space-y-3">
                                    {result.protocol.map((p, i) => (
                                        <div key={i} className="flex gap-4 p-5 bg-secondary/20 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-foreground font-medium">{p}</p>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                    Acción enfocada
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Final CTA */}
                            <div className="p-8 bg-zinc-900 rounded-[32px] border border-white/5 text-center space-y-6 shadow-2xl">
                                <div className="space-y-2">
                                    <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Frase Ancla</div>
                                    <p className="text-xl font-serif font-medium text-white italic">
                                        "{result.anchor}"
                                    </p>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <Button onClick={() => navigate("/dashboard")} className="w-full h-14 rounded-2xl text-lg font-bold gap-2">
                                        Volver al Dashboard <ArrowRight className="h-5 w-5" />
                                    </Button>
                                    <div className="flex items-center justify-center gap-4 pt-2">
                                        <button
                                            onClick={() => {
                                                toast.success("Resultado guardado en tu historial evolutivo.");
                                            }}
                                            className="text-xs text-muted-foreground hover:text-white transition-colors"
                                        >
                                            Guardar en mi historial
                                        </button>
                                        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                        <button
                                            onClick={() => {
                                                toast.info("Función de compartir victoria se activará en la Fase B6 (Tribunal del Poder).");
                                            }}
                                            className="text-xs text-muted-foreground hover:text-white transition-colors"
                                        >
                                            Compartir Victoria
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
