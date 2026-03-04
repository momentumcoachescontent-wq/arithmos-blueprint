import { useState, useCallback, useEffect } from "react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export interface CoachMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at: string;
}

export interface CoachSession {
    id: string;
    title: string | null;
    status: "active" | "completed" | "archived";
    created_at: string;
}

export function useCoachSession() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const [sessions, setSessions] = useState<CoachSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<CoachMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    // Cargar sesiones
    const fetchSessions = useCallback(async () => {
        if (!user) return;
        const { data, error } = await (supabase
            .from("coach_sessions" as any)
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })) as { data: CoachSession[] | null, error: any };

        if (error) {
            console.error("Error fetching sessions:", error);
            return;
        }
        setSessions(data || []);
    }, [user]);

    // Cargar mensajes de una sesión
    const loadSession = useCallback(async (sessionId: string) => {
        setIsLoading(true);
        setActiveSessionId(sessionId);
        const { data, error } = await (supabase
            .from("coach_messages" as any)
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true })) as { data: CoachMessage[] | null, error: any };

        if (error) {
            console.error("Error loading messages:", error);
            toast.error("Error al cargar la sesión");
        } else {
            setMessages(data || []);
        }
        setIsLoading(false);
    }, []);

    // Crear nueva sesión
    const createSession = useCallback(async () => {
        if (!user) return null;
        const { data, error } = await (supabase
            .from("coach_sessions" as any)
            .insert({ user_id: user.id })
            .select()
            .single()) as { data: CoachSession | null, error: any };

        if (error || !data) {
            console.error("Error creating session:", error);
            toast.error("No se pudo iniciar la sesión");
            return null;
        }

        setSessions(prev => [data, ...prev]);
        setActiveSessionId(data.id);
        setMessages([]);
        return data.id;
    }, [user]);

    // Enviar mensaje y recibir streaming
    const sendMessage = useCallback(async (content: string) => {
        if (!user || !content.trim()) return;

        let sessionId = activeSessionId;
        if (!sessionId) {
            sessionId = await createSession();
            if (!sessionId) return;
        }

        // Optimistic UI for User Message
        const tempUserMsg: CoachMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMsg]);

        // Guardar en BD en background
        const saveUserMessage = async () => {
            const { error } = await (supabase.from("coach_messages" as any).insert({
                session_id: sessionId,
                role: "user",
                content
            }) as any);
            if (error) console.error("Error saving user message:", error);
        };
        saveUserMessage();

        setIsStreaming(true);

        const tempAssistantId = crypto.randomUUID();
        setMessages(prev => [...prev, {
            id: tempAssistantId,
            role: "assistant",
            content: "",
            created_at: new Date().toISOString(),
        }]);

        try {
            // Formatear historial para el LLM
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            history.push({ role: "user", content }); // añadir el nuevo

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${SUPABASE_URL}/functions/v1/chat-coach`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token || SUPABASE_PUBLISHABLE_KEY}`,
                    "apikey": SUPABASE_PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    messages: history,
                    action: "chat",
                    context: {
                        name: profile?.name,
                        lifePath: profile?.lifePathNumber
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Error en API: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No reader");

            let assistantContent = "";
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === tempAssistantId ? { ...m, content: assistantContent } : m
                ));
            }

            // Guardar respuesta del asistente en BD
            await supabase.from("coach_messages" as any).insert({
                session_id: sessionId,
                role: "assistant",
                content: assistantContent
            });

        } catch (error) {
            console.error("Error in chat:", error);
            toast.error("El Coach no pudo responder en este momento.");
            setMessages(prev => prev.filter(m => m.id !== tempAssistantId));
        } finally {
            setIsStreaming(false);
        }

    }, [user, activeSessionId, messages, profile, createSession]);

    // Terminar y resumir sesión
    const endSession = useCallback(async () => {
        if (!user || !activeSessionId || messages.length < 2) return;
        setIsLoading(true);
        toast.info("Concluyendo sesión e integrando aprendizajes...");

        try {
            // 1. Pedir Resumen a Edge Function
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const { data: summaryData, error: summaryError } = await supabase.functions.invoke("chat-coach", {
                body: { messages: history, action: "summarize" }
            });

            if (summaryError || !summaryData?.summary) throw new Error("Fallo al resumir");

            // 2. Guardar en Journal
            const dateStr = new Date().toISOString().split('T')[0];
            const title = `Coach MADM (${dateStr}): Conversaciones Honestas`;

            await supabase.from("journal_entries").insert({
                user_id: user.id,
                title: title,
                content: summaryData.summary
            });

            // 3. Marcar Sesión como completada
            await supabase.from("coach_sessions" as any)
                .update({ status: 'completed' })
                .eq("id", activeSessionId);

            toast.success("Sesión concluida. Resumen guardado en el Diario de Sombras.");
            fetchSessions();
            setActiveSessionId(null);
            setMessages([]);

        } catch (error) {
            console.error("Error ending session:", error);
            toast.error("No se pudo guardar el resumen, pero tus mensajes están a salvo.");
        } finally {
            setIsLoading(false);
        }

    }, [user, activeSessionId, messages, fetchSessions]);


    return {
        sessions,
        activeSessionId,
        messages,
        isLoading,
        isStreaming,
        fetchSessions,
        loadSession,
        createSession,
        sendMessage,
        endSession
    };
}
