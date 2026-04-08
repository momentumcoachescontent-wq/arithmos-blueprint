import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useStreak(userId?: string) {
  const [streak, setStreak] = useState(0);

  const logAndFetch = useCallback(async (uid: string) => {
    const today = new Date().toISOString().split("T")[0];

    // Log today's pulse visit — safe to call multiple times (unique constraint)
    await supabase.from("streak_logs").upsert(
      { user_id: uid, logged_date: today, action_type: "pulse", xp_earned: 0 },
      { onConflict: "user_id,logged_date,action_type", ignoreDuplicates: true }
    );

    const { data } = await supabase
      .from("streak_logs")
      .select("logged_date")
      .eq("user_id", uid)
      .gte("logged_date", new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0])
      .order("logged_date", { ascending: false });

    if (!data || data.length === 0) {
      setStreak(1);
      return;
    }

    // Unique dates sorted descending
    const uniqueDates = [...new Set(data.map((r) => r.logged_date))].sort().reverse();

    let count = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        // First entry must be today (we just logged it)
        count = 1;
      } else {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diff === 1) {
          count++;
        } else {
          break;
        }
      }
    }

    setStreak(count);
  }, []);

  useEffect(() => {
    if (userId) logAndFetch(userId);
  }, [userId, logAndFetch]);

  return { streak };
}
