import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    aiReflection?: string;
    shadowPattern?: string;
    personalNumberAtEntry?: number;
    type: string;
    createdAt: string;
}

export function useJournal(userId?: string) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEntries = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        const { data } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setEntries(data.map(e => ({
                id: e.id,
                title: e.title,
                content: e.content,
                aiReflection: e.ai_reflection || undefined,
                shadowPattern: e.shadow_pattern || undefined,
                personalNumberAtEntry: e.personal_number_at_entry || undefined,
                type: e.type,
                createdAt: e.created_at,
            })));
        }
        setIsLoading(false);
    }, [userId]);

    const createEntry = useCallback(async (
        title: string,
        content: string,
        personalNumber?: number,
        type = 'shadow_work'
    ) => {
        if (!userId) return null;

        const { data, error } = await supabase
            .from('journal_entries')
            .insert({
                user_id: userId,
                title,
                content,
                personal_number_at_entry: personalNumber,
                type,
            })
            .select()
            .single();

        if (!error && data) {
            const newEntry: JournalEntry = {
                id: data.id,
                title: data.title,
                content: data.content,
                aiReflection: data.ai_reflection || undefined,
                shadowPattern: data.shadow_pattern || undefined,
                personalNumberAtEntry: data.personal_number_at_entry || undefined,
                type: data.type,
                createdAt: data.created_at,
            };
            setEntries(prev => [newEntry, ...prev]);
            return newEntry;
        }
        return null;
    }, [userId]);

    const deleteEntry = useCallback(async (entryId: string) => {
        if (!userId) return;
        await supabase.from('journal_entries').delete().eq('id', entryId).eq('user_id', userId);
        setEntries(prev => prev.filter(e => e.id !== entryId));
    }, [userId]);

    return { entries, isLoading, fetchEntries, createEntry, deleteEntry };
}
