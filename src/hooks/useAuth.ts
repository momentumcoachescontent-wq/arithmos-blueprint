import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email?: string;
  isAnonymous?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("arithmos_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    // Sincronizar sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const isAnon = session.user.is_anonymous ?? false;
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || user?.name || "Usuario",
          email: session.user.email,
          isAnonymous: isAnon,
        };
        setUser(userData);
        localStorage.setItem("arithmos_user", JSON.stringify(userData));
      }
    });

    // Escuchar cambios de sesión (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const isAnon = session.user.is_anonymous ?? false;
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || user?.name || "Usuario",
          email: session.user.email,
          isAnonymous: isAnon,
        };
        setUser(userData);
        localStorage.setItem("arithmos_user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("arithmos_user");
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = !!user;

  /**
   * Registro con email y contraseña (Fase 3)
   * Convierte una sesión anónima en cuenta real si el usuario tiene ID anónimo activo
   */
  const registerWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    // Si la sesión actual es anónima, la convertimos (link identity)
    const { data: currentSession } = await supabase.auth.getSession();
    const isCurrentAnon = currentSession.session?.user?.is_anonymous ?? false;

    if (isCurrentAnon && currentSession.session) {
      // Convertir sesión anónima → cuenta real
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: { full_name: fullName },
      });
      if (error) throw error;
      if (data.user) {
        // Actualizar perfil en DB
        await supabase.from('profiles').update({
          email,
          is_anonymous: false,
        }).eq('user_id', data.user.id);
      }
      return data.user;
    }

    // Registro completamente nuevo
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data.user;
  }, []);

  /**
   * Login con email y contraseña
   */
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }, []);

  /**
   * Login anónimo (usado para la consulta inicial sin registro)
   * Siempre verifica si hay sesión activa; si no, crea una anónima.
   */
  const login = useCallback(async (userData: User) => {
    const { data: { session } } = await supabase.auth.getSession();

    let userId = userData.id;

    if (!session) {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          // 422: Anonymous sign-ins desactivado en Supabase Dashboard
          // → Authentication → Sign In Methods → Enable Anonymous
          console.error("❌ Supabase Anonymous Auth desactivado. Actívalo en tu Dashboard.", error.message);
        } else if (data.user) {
          userId = data.user.id;
        }
      } catch (err) {
        console.error("Error en signInAnonymously:", err);
      }
    } else {
      userId = session.user.id;
    }

    const finalUser = { ...userData, id: userId, isAnonymous: !session?.user?.email };
    localStorage.setItem("arithmos_user", JSON.stringify(finalUser));
    setUser(finalUser);
    return finalUser;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("arithmos_user");
    localStorage.removeItem("arithmos_profile");
    setUser(null);
  }, []);

  return { user, isAuthenticated, login, loginWithEmail, registerWithEmail, logout };
}
