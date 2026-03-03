import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
    xp: number;
    level: number;
    showInRanking: boolean;
    nextLevelXp: number;
    progressPercent: number;
}

function xpForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
}

function xpForNextLevel(level: number): number {
    return Math.pow(level, 2) * 100;
}

export function useStats(userId?: string) {
    const [stats, setStats] = useState<UserStats | null>(null);

    const fetchStats = useCallback(async () => {
        if (!userId) return null;

        // Asegurar que exista el registro
        await supabase.from('user_stats').upsert(
            { user_id: userId, xp: 0, level: 1 },
            { onConflict: 'user_id', ignoreDuplicates: true }
        );

        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!data || error) return null;

        const currentLevel = data.level || 1;
        const currentXp = data.xp || 0;
        const currentLevelXp = xpForLevel(currentLevel);
        const nextLvlXp = xpForNextLevel(currentLevel);
        const xpInCurrentLevel = currentXp - currentLevelXp;
        const xpNeeded = nextLvlXp - currentLevelXp;
        const progress = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

        const userStats: UserStats = {
            xp: currentXp,
            level: currentLevel,
            showInRanking: data.show_in_ranking || false,
            nextLevelXp: nextLvlXp,
            progressPercent: progress,
        };

        setStats(userStats);
        return userStats;
    }, [userId]);

    const awardXp = useCallback(async (amount: number) => {
        if (!userId) return;
        await supabase.rpc('award_xp', { p_user_id: userId, p_xp: amount });
        await fetchStats();
    }, [userId, fetchStats]);

    const toggleRanking = useCallback(async (show: boolean) => {
        if (!userId) return;
        await supabase.from('user_stats').update({ show_in_ranking: show }).eq('user_id', userId);
        setStats(prev => prev ? { ...prev, showInRanking: show } : prev);
    }, [userId]);

    return { stats, fetchStats, awardXp, toggleRanking };
}
