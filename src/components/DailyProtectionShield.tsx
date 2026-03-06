import React from "react";
import { Shield, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DailyProtectionShieldProps {
    birthDate: string;
}

export function DailyProtectionShield({ birthDate }: DailyProtectionShieldProps) {
    // Lógica de cálculo del Día Personal
    const calculatePersonalDay = () => {
        if (!birthDate) return 5; // Fallback neutral

        const today = new Date();
        const bDate = new Date(birthDate);

        const birthDay = bDate.getUTCDate();
        const birthMonth = bDate.getUTCMonth() + 1;
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        // Reducir un número a un solo dígito (o maestro)
        const reduce = (num: number): number => {
            let sum = num;
            while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
                sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
            }
            return sum;
        };

        const yearSub = currentYear.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        const personalYear = reduce(birthDay + birthMonth + yearSub);
        const personalMonth = reduce(personalYear + currentMonth);
        const personalDay = reduce(personalMonth + currentDay);

        return personalDay;
    };

    const personalDay = calculatePersonalDay();

    // Definir nivel de riesgo
    const getRiskLevel = (num: number) => {
        // Verde: Días de expansión, éxito, comunicación o maestría
        if ([1, 3, 5, 8, 11, 22, 33].includes(num)) {
            return {
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                label: "Día de Poder",
                description: "Tu energía está en máxima sintonía. Es un momento excelente para actuar, decidir y expandirte. El universo te respalda.",
                status: "verde"
            };
        }
        // Amarillo: Días de colaboración, estructura o familia
        if ([2, 4, 6].includes(num)) {
            return {
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                label: "Día de Precaución",
                description: "Frecuencia de observación. Prioriza la diplomacia, el orden y el cuidado de los detalles. No te apresures.",
                status: "amarillo"
            };
        }
        // Rojo: Días de introspección profunda o cierre (7 y 9 pueden ser intensos emocionalmente)
        return {
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            label: "Día de Protección",
            description: "Energía de introspección o cierre. Evita confrontaciones y decisiones impulsivas. Mantente en tu centro y protege tu paz.",
            status: "rojo"
        };
    };

    const risk = getRiskLevel(personalDay);

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-help shadow-sm",
                            risk.bg,
                            risk.border,
                            risk.status === 'verde' && "shadow-emerald-500/10 glow-emerald",
                            risk.status === 'rojo' && "shadow-rose-500/10 glow-rose"
                        )}>
                        <motion.div
                            animate={risk.status === 'verde' ? {
                                scale: [1, 1.2, 1],
                                opacity: [1, 0.8, 1]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        >
                            <Shield className={cn("h-4 w-4 fill-current", risk.color)} />
                        </motion.div>
                        <span className={cn("text-[10px] font-sans font-bold uppercase tracking-wider", risk.color)}>
                            Escudo {risk.status === 'verde' ? 'Máximo' : risk.status === 'amarillo' ? 'Activo' : 'Refuerzo'}
                        </span>
                        {risk.status === 'verde' && (
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-1 h-1 rounded-full bg-emerald-500"
                            />
                        )}
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[260px] p-4 glass border-primary/20 shadow-xl backdrop-blur-xl">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                            <div className="flex items-center gap-2">
                                <Shield className={cn("h-4 w-4", risk.color)} />
                                <p className={cn("text-xs font-bold uppercase tracking-widest", risk.color)}>
                                    {risk.label}
                                </p>
                            </div>
                            <span className="text-[10px] font-mono opacity-50">Día {personalDay}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">
                            {risk.description}
                        </p>
                        <div className="pt-1">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                                Frecuencia calculada para hoy
                            </p>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
