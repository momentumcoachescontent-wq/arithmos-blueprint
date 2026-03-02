import { useState, useCallback } from "react";

export interface Profile {
  name: string;
  birthDate: string;
  lifePathNumber: number;
  archetype: string;
  description: string;
  createdAt: string;
}

const ARCHETYPES: Record<number, { name: string; description: string }> = {
  1: { name: "El Pionero", description: "Líder nato con una voluntad inquebrantable. Tu energía es la de quien abre caminos donde nadie ve posibilidad." },
  2: { name: "El Diplomático", description: "Maestro de la cooperación y la intuición sutil. Tu poder reside en la capacidad de ver lo que otros ignoran en las relaciones." },
  3: { name: "El Comunicador", description: "Catalizador creativo que transforma ideas abstractas en realidades tangibles. Tu expresión es tu arma estratégica." },
  4: { name: "El Arquitecto de Sistemas", description: "Constructor metódico de estructuras duraderas. Tu disciplina y visión a largo plazo son tu ventaja competitiva definitiva." },
  5: { name: "El Agente de Cambio", description: "Adaptable y magnético. Prosperas en el caos y conviertes la incertidumbre en oportunidad donde otros ven riesgo." },
  6: { name: "El Estratega del Equilibrio", description: "Armonizador nato que entiende que el verdadero poder está en la responsabilidad consciente y el servicio estratégico." },
  7: { name: "El Analista Profundo", description: "Pensador penetrante que opera en un nivel de percepción que otros no pueden alcanzar. Tu introspección es tu superpoder." },
  8: { name: "El Ejecutor de Poder", description: "Manifestador de abundancia y autoridad. Entiendes las leyes del poder material y las usas con precisión quirúrgica." },
  9: { name: "El Visionario Global", description: "Conciencia expandida que ve el panorama completo. Tu misión trasciende lo personal y toca lo colectivo." },
};

function calculateLifePath(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum > 9 ? sum % 9 || 9 : sum;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(() => {
    const stored = localStorage.getItem("arithmos_profile");
    return stored ? JSON.parse(stored) : null;
  });

  const createProfile = useCallback((name: string, birthDate: string) => {
    const lifePathNumber = calculateLifePath(birthDate);
    const arch = ARCHETYPES[lifePathNumber] || ARCHETYPES[1];
    const newProfile: Profile = {
      name,
      birthDate,
      lifePathNumber,
      archetype: arch.name,
      description: arch.description,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("arithmos_profile", JSON.stringify(newProfile));
    setProfile(newProfile);
    return newProfile;
  }, []);

  return { profile, createProfile };
}
