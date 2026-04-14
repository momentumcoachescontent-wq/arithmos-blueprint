/**
 * Arithmos V3 — useCosmicStreak
 *
 * Gestiona la racha espiritual diaria del usuario.
 * Usa la tabla cosmic_streaks creada en la migración v3.
 *
 * Lógica:
 * - checkin() se llama una vez por día (desde CosmicDashboard al montar)
 * - Si last_checkin_at === ayer → incrementa racha
 * - Si última visita fue antes de ayer → resetea racha a 1
 * - Si ya hizo checkin hoy → no hace nada
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CosmicStreakData {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  lastCheckinAt: string | null;
  checkedInToday: boolean;
}

const DEFAULT_STREAK: CosmicStreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalCheckins: 0,
  lastCheckinAt: null,
  checkedInToday: false,
};

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function useCosmicStreak(userId?: string) {
  const [streak, setStreak] = useState<CosmicStreakData>(DEFAULT_STREAK);
  const [loading, setLoading] = useState(false);

  const fetchStreak = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("cosmic_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      const today = getTodayStr();
      setStreak({
        currentStreak: data.current_streak ?? 0,
        longestStreak: data.longest_streak ?? 0,
        totalCheckins: data.total_checkins ?? 0,
        lastCheckinAt: data.last_checkin_at,
        checkedInToday: data.last_checkin_at === today,
      });
    }
  }, [userId]);

  const checkin = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    const { data: existing } = await supabase
      .from("cosmic_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existing) {
      // Already checked in today
      if (existing.last_checkin_at === today) {
        setLoading(false);
        return;
      }

      let newStreak = 1;
      if (existing.last_checkin_at === yesterday) {
        // Consecutive day
        newStreak = (existing.current_streak ?? 0) + 1;
      }

      const newLongest = Math.max(existing.longest_streak ?? 0, newStreak);
      const newTotal = (existing.total_checkins ?? 0) + 1;

      await supabase
        .from("cosmic_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          total_checkins: newTotal,
          last_checkin_at: today,
        })
        .eq("user_id", userId);

      setStreak({
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalCheckins: newTotal,
        lastCheckinAt: today,
        checkedInToday: true,
      });
    } else {
      // First checkin ever
      await supabase.from("cosmic_streaks").insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        total_checkins: 1,
        last_checkin_at: today,
      });

      setStreak({
        currentStreak: 1,
        longestStreak: 1,
        totalCheckins: 1,
        lastCheckinAt: today,
        checkedInToday: true,
      });
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchStreak();
  }, [userId, fetchStreak]);

  return { streak, checkin, fetchStreak, loading };
}
