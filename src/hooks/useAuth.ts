import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("arithmos_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || user?.name || "Usuario",
          email: session.user.email
        };
        setUser(userData);
        localStorage.setItem("arithmos_user", JSON.stringify(userData));
      }
    });
  }, [user?.name]);

  const isAuthenticated = !!user;

  const login = useCallback(async (userData: User) => {
    // Si ya tenemos un usuario de Supabase, lo usamos. 
    // Si no, podríamos hacer signInAnonymously() aquí para asegurar un UUID válido en la DB.
    let userId = userData.id;

    if (!userId.includes("-")) { // Si parece un ID falso/mock
      const { data } = await supabase.auth.signInAnonymously();
      if (data.user) userId = data.user.id;
    }

    const finalUser = { ...userData, id: userId };
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

  return { user, isAuthenticated, login, logout };
}
