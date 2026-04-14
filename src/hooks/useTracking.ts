import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useTracking() {
    const { user } = useAuth();
    const sessionId = useRef(crypto.randomUUID());

    const trackEvent = useCallback(async (
        eventName: string,
        targetFeature?: string,
        metadata: Record<string, any> = {},
        durationSeconds: number = 0
    ) => {
        if (!user) return; // Only track authenticated users

        try {
            await supabase.from('user_telemetry').insert({
                user_id: user.id,
                session_id: sessionId.current,
                event_name: eventName,
                target_feature: targetFeature,
                duration_seconds: durationSeconds,
                metadata: metadata
            });
        } catch (e) {
            console.error("Tracking Error:", e);
        }
    }, [user]);

    return { trackEvent, sessionId: sessionId.current };
}

export function useHeartbeat(targetFeature: string) {
    const { trackEvent } = useTracking();
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Track feature open
        trackEvent('feature_open', targetFeature);

        // Track heartbeat every 60 seconds
        intervalRef.current = setInterval(() => {
            trackEvent('heartbeat', targetFeature, {}, 60);
        }, 60000);

        return () => {
            // Track feature close
            trackEvent('feature_close', targetFeature);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [trackEvent, targetFeature]);
}
