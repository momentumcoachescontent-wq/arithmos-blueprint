import { useState, useCallback } from "react";

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

  const isAuthenticated = !!user;

  const login = useCallback((userData: User) => {
    localStorage.setItem("arithmos_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("arithmos_user");
    localStorage.removeItem("arithmos_profile");
    setUser(null);
  }, []);

  return { user, isAuthenticated, login, logout };
}
