import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SynchronicityResult {
    analysis: string;
    significance: number; // 0-100
    influence: number;    // 0-100
    actionStep: string;
}

export function useSynchronicity(userId?: string) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<SynchronicityResult | null>(null);
    const [limitReached, setLimitReached] = useState(false);

    const checkLimit = useCallback(async () => {
        if (!userId) return false;

        const { count, error } = await supabase
            .from('readings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'synchronicity')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (error) {
            console.error("Error checking synchronization limit:", error);
            return false;
        }

        const reached = (count || 0) >= 3;
        setLimitReached(reached);
        return reached;
    }, [userId]);

    // Verificar límite al cargar si hay userId
    useEffect(() => {
        if (userId) {
            checkLimit();
        }
    }, [userId, checkLimit]);

    const analyzeEvent = useCallback(async (description: string) => {
        if (!description.trim()) return;

        // Verificar límite antes de proceder
        const reached = await checkLimit();
        if (reached) {
            throw new Error("Has alcanzado el límite de 3 consultas de sincronicidad por hoy.");
        }

        setIsAnalyzing(true);
        setResult(null);

        try {
            const response = await fetch("https://n8n-n8n.z3tydl.easypanel.host/webhook/arithmos-synchronicity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, description })
            });

            if (!response.ok) throw new Error("Error en el servidor de IA");

            const data = await response.json();

            const newResult: SynchronicityResult = {
                analysis: data.analysis || "El universo susurra a través de este evento, sugiriendo un alineamiento con tu propósito actual.",
                significance: data.significance || 75,
                influence: data.influence || 60,
                actionStep: data.action_step || "Observa la siguiente repetición de este patrón en las próximas 48 horas."
            };

            setResult(newResult);

            // Guardar en readings para el historial
            if (userId) {
                await supabase.from('readings').insert({
                    user_id: userId,
                    title: "Consulta de Sincronicidad",
                    type: 'synchronicity',
                    metadata: {
                        description,
                        analysis: newResult.analysis,
                        significance: newResult.significance,
                        influence: newResult.influence,
                        action_step: newResult.actionStep
                    }
                });
                // Re-verificar límite tras insertar
                await checkLimit();
            }

            return newResult;
        } catch (error) {
            console.error("Error en análisis de sincronicidad:", error);
            throw error;
        } finally {
            setIsAnalyzing(false);
        }
    }, [userId, checkLimit]);

    const reset = useCallback(() => {
        setResult(null);
    }, []);

    return { analyzeEvent, isAnalyzing, result, limitReached, checkLimit, reset };
}
