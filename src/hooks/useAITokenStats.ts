import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

export interface AITokenUsage {
    id: string;
    user_id: string;
    feature: string;
    model_id: string;
    prompt_tokens: number;
    completion_tokens: number;
    estimated_cost_usd: number;
    created_at: string;
}

export interface AIStatsSummary {
    totalCostUSD: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    topFeature: { name: string; cost: number } | null;
}

export interface DailyAITrend {
    date: string;
    cost: number;
    tokens: number;
}

export interface TopUserAI {
    user_id: string;
    email: string;
    name: string;
    total_cost: number;
    total_tokens: number;
}

export function useAITokenStats() {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<AIStatsSummary>({
        totalCostUSD: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        topFeature: null
    });
    const [trendData, setTrendData] = useState<DailyAITrend[]>([]);
    const [topUsers, setTopUsers] = useState<TopUserAI[]>([]);

    const fetchStats = useCallback(async (daysToLookBack = 30) => {
        setIsLoading(true);
        try {
            const startDate = subDays(new Date(), daysToLookBack).toISOString();
            
            // 1. Obtener todos los registros en el rango (Paginación podría ser necesaria si hay mucho volumen)
            const { data, error } = await (supabase as any)
                .from('ai_token_usage')
                .select('*')
                .gte('created_at', startDate);

            if (error) {
                console.error("Error fetching AI token usage:", error);
                throw error;
            }

            const usageData: AITokenUsage[] = (data as any[]) || [];

            // 2. Calcular Summary Global
            let totalCost = 0;
            let totalPrompt = 0;
            let totalCompletion = 0;
            const featureCosts: Record<string, number> = {};
            const userAggregations: Record<string, { cost: number; tokens: number }> = {};

            usageData.forEach(row => {
                totalCost += Number(row.estimated_cost_usd);
                totalPrompt += row.prompt_tokens;
                totalCompletion += row.completion_tokens;

                // Feature aggregation
                if (!featureCosts[row.feature]) featureCosts[row.feature] = 0;
                featureCosts[row.feature] += Number(row.estimated_cost_usd);

                // User aggregation
                if (!userAggregations[row.user_id]) userAggregations[row.user_id] = { cost: 0, tokens: 0 };
                userAggregations[row.user_id].cost += Number(row.estimated_cost_usd);
                userAggregations[row.user_id].tokens += row.prompt_tokens + row.completion_tokens;
            });

            // Find top feature
            let topFeatureName = "N/A";
            let topFeatureCost = 0;
            Object.entries(featureCosts).forEach(([feature, cost]) => {
                if (cost > topFeatureCost) {
                    topFeatureCost = cost;
                    topFeatureName = feature;
                }
            });

            setSummary({
                totalCostUSD: Number(totalCost.toFixed(4)),
                totalPromptTokens: totalPrompt,
                totalCompletionTokens: totalCompletion,
                topFeature: topFeatureCost > 0 ? { name: topFeatureName, cost: Number(topFeatureCost.toFixed(4)) } : null
            });

            // 3. Build Daily Trend (last 7 or 30 days)
            const dailyMap: Record<string, { cost: number; tokens: number }> = {};
            for (let i = Math.min(daysToLookBack, 14) - 1; i >= 0; i--) {
                const day = format(subDays(new Date(), i), 'MMM dd', { locale: es });
                dailyMap[day] = { cost: 0, tokens: 0 };
            }

            usageData.forEach(row => {
                const dayStr = format(new Date(row.created_at), 'MMM dd', { locale: es });
                if (dailyMap[dayStr]) {
                    dailyMap[dayStr].cost += Number(row.estimated_cost_usd);
                    dailyMap[dayStr].tokens += (row.prompt_tokens + row.completion_tokens);
                }
            });

            const formattedTrend: DailyAITrend[] = Object.entries(dailyMap).map(([date, data]) => ({
                date,
                cost: Number(data.cost.toFixed(4)),
                tokens: data.tokens
            }));
            setTrendData(formattedTrend);

            // 4. Resolve Top 5 Users
            const topUserIds = Object.entries(userAggregations)
                .sort((a, b) => b[1].cost - a[1].cost)
                .slice(0, 5)
                .map(entry => entry[0]);

            if (topUserIds.length > 0) {
                 const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('user_id, email, name')
                    .in('user_id', topUserIds);

                 if (profilesData) {
                     const enrichedUsers: TopUserAI[] = profilesData.map(p => ({
                         user_id: p.user_id,
                         email: p.email || 'Unknown',
                         name: p.name || 'Anonymous',
                         total_cost: Number(userAggregations[p.user_id].cost.toFixed(4)),
                         total_tokens: userAggregations[p.user_id].tokens
                     })).sort((a, b) => b.total_cost - a.total_cost);

                     setTopUsers(enrichedUsers);
                 }
            } else {
                setTopUsers([]);
            }

        } catch (error) {
            console.error("useAITokenStats failed", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        summary,
        trendData,
        topUsers,
        isLoading,
        fetchStats
    };
}
