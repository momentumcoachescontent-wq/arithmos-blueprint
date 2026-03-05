import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HistoryItem {
    id: string;
    title: string;
    type: 'daily_pulse' | 'mini_blueprint' | 'journal_entry' | 'team_reading' | 'friction_radar';
    date: string;
    summary?: string;
    metadata?: any;
}

export function useHistory(userId?: string) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);

        try {
            // Fetch readings
            const { data: readings, error: readingsError } = await supabase
                .from('readings')
                .select('id, title, type, created_at, metadata')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (readingsError) throw readingsError;

            // Fetch journal entries
            const { data: journals, error: journalsError } = await supabase
                .from('journal_entries')
                .select('id, title, created_at, content')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (journalsError) throw journalsError;

            // Fetch team readings (Radar de Equipo)
            const { data: teamReadings } = await supabase
                .from('team_readings' as any)
                .select('id, title, members, created_at')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            // Fetch friction diagnostics
            const { data: frictionData } = await supabase
                .from('friction_diagnostics' as any)
                .select('id, goal_text, profile_id, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            // Combine and format
            const combined: HistoryItem[] = [
                ...(readings?.map(r => ({
                    id: r.id,
                    title: r.title,
                    type: r.type as any,
                    date: r.created_at,
                    metadata: r.metadata
                })) || []),
                ...(journals?.map(j => ({
                    id: j.id,
                    title: j.title || 'Entrada de Diario',
                    type: 'journal_entry' as const,
                    date: j.created_at,
                    summary: j.content?.substring(0, 100) + '...'
                })) || []),
                ...((teamReadings as any[])?.map(t => ({
                    id: t.id,
                    title: `Radar: ${t.title}`,
                    type: 'team_reading' as const,
                    date: t.created_at,
                    summary: `${(t.members as any[]).length} integrantes analizados`
                })) || []),
                ...((frictionData as any[])?.map(f => ({
                    id: f.id,
                    title: `Fricción: ${f.goal_text.substring(0, 20)}...`,
                    type: 'friction_radar' as const,
                    date: f.created_at,
                    summary: `Perfil: ${f.profile_id}`
                })) || [])
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistory(combined);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, isLoading, fetchHistory };
}
