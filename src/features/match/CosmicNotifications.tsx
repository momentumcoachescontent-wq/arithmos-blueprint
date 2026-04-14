/**
 * Arithmos V3 — Cosmic Notifications
 *
 * Feed de actividad para Likes y Matches cósmicos.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export interface CosmicNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

export function CosmicNotifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<CosmicNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Suscripción en tiempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as CosmicNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(20);

    if (!error) {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
      
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  };

  if (loading && notifications.length === 0) {
    return <div className="text-center py-10 text-xs text-white/30 italic">Sintonizando vibraciones...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10 space-y-2">
        <div className="text-2xl opacity-20">🍃</div>
        <p className="text-[10px] uppercase tracking-widest text-white/20">Silencio Cósmico</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Vibraciones Recientes</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => markAsRead(n.id)}
              className="p-3 rounded-2xl relative cursor-pointer"
              style={{
                background: n.read_at ? "hsla(260 30% 10% / 0.4)" : "hsla(260 60% 20% / 0.4)",
                border: n.read_at ? "1px solid hsla(260 30% 30% / 0.2)" : "1px solid hsla(270 80% 50% / 0.3)",
              }}
            >
              {!n.read_at && (
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_pink]"></div>
              )}
              
              <div className="flex gap-3">
                <div className="text-xl">
                  {n.type === 'vibe_like' ? '✨' : n.type === 'cosmic_match' ? '💞' : '🔔'}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white leading-tight">{n.title}</h4>
                  <p className="text-[10px] text-white/60 leading-normal mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[8px] uppercase font-bold mt-2 opacity-30">
                    {formatDistanceToNow(new Date(n.sent_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
