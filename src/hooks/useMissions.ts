import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: string;
    xpReward: number;
    personalNumber?: number;
    isCompleted?: boolean;
}

function reduceToSingleDigitOrMaster(num: number): number {
    const masters = [11, 22, 33];
    let current = num;
    while (current > 9 && !masters.includes(current)) {
        current = current.toString().split("").map(Number).reduce((a, b) => a + b, 0);
    }
    return current;
}

function getTodayPersonalNumber(birthDate: string): number {
    const today = new Date();
    const [, bMonth, bDay] = birthDate.split("-").map(Number);
    const raw = today.getDate() + (today.getMonth() + 1) + bDay + bMonth;
    return reduceToSingleDigitOrMaster(raw);
}

export function useMissions(userId?: string, birthDate?: string) {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completedToday, setCompletedToday] = useState<string[]>([]);

    const fetchMissions = useCallback(async () => {
        if (!userId || !birthDate) return;

        const personalNumber = getTodayPersonalNumber(birthDate);

        // Obtener misión del número personal del día + 2 misiones universales
        const { data: allMissions } = await supabase
            .from('missions')
            .select('*')
            .or(`personal_number.is.null,personal_number.eq.${personalNumber}`)
            .limit(4);

        // Obtener completadas hoy usando la columna completed_date
        const today = new Date().toISOString().split("T")[0];
        const { data: completedData } = await supabase
            .from('user_missions')
            .select('mission_id')
            .eq('user_id', userId)
            .eq('completed_date', today);

        const completedIds = (completedData || []).map(c => c.mission_id);
        setCompletedToday(completedIds);

        const mapped: Mission[] = (allMissions || []).map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            type: m.type,
            xpReward: m.xp_reward,
            personalNumber: m.personal_number,
            isCompleted: completedIds.includes(m.id),
        }));

        setMissions(mapped);
        return { missions: mapped, personalNumber };
    }, [userId, birthDate]);

    const completeMission = useCallback(async (missionId: string, personalNumber: number, onXpAwarded?: (xp: number) => void) => {
        if (!userId) return;

        const mission = missions.find(m => m.id === missionId);
        if (!mission || mission.isCompleted) return;

        const { error } = await supabase.from('user_missions').insert({
            user_id: userId,
            mission_id: missionId,
            completed_date: new Date().toISOString().split("T")[0],
            personal_number_at_completion: personalNumber,
        });

        if (!error) {
            setMissions(prev => prev.map(m => m.id === missionId ? { ...m, isCompleted: true } : m));
            setCompletedToday(prev => [...prev, missionId]);
            if (onXpAwarded) onXpAwarded(mission.xpReward);
        }
    }, [userId, missions]);

    return { missions, completedToday, fetchMissions, completeMission };
}
