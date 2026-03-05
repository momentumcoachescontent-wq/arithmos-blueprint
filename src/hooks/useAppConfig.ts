import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppConfig {
    premium_price: string;
    premium_currency: string;
    premium_cta_label: string;
}

const DEFAULT_CONFIG: AppConfig = {
    premium_price: "9.99",
    premium_currency: "USD",
    premium_cta_label: "Activar Premium",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useAppConfig() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConfig = useCallback(async () => {
        try {
            const { data, error } = await db.from("app_config").select("key, value");
            if (error) throw error;
            if (data && data.length > 0) {
                const mapped = data.reduce((acc: Record<string, string>, row: { key: string; value: string }) => {
                    acc[row.key] = row.value;
                    return acc;
                }, {} as Record<string, string>);
                setConfig({ ...DEFAULT_CONFIG, ...mapped } as AppConfig);
            }
        } catch (err) {
            console.error("useAppConfig — Error fetching config:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
        const entries = Object.entries(updates);
        for (const [key, value] of entries) {
            await db.from("app_config").upsert({ key, value, updated_at: new Date().toISOString() });
        }
        setConfig((prev) => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return { config, isLoading, updateConfig, refetch: fetchConfig };
}
