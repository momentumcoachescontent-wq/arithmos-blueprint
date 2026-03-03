import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  name: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber?: number;
  soulUrgeNumber?: number;
  personalityNumber?: number;
  maturityNumber?: number;
  archetype: string;
  description: string;
  // Fase 2: Narrativa IA
  narrative?: string;
  powerStrategy?: string;
  shadowWork?: string;
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
  11: { name: "El Iluminador Maestro", description: "Potencial magnético con una visión altamente intuitiva. Eres un puente entre lo visible y lo invisible." },
  22: { name: "El Constructor Maestro", description: "Capacidad pragmática suprema para convertir visiones en imperios. Tu legado es tangible y transformador." },
  33: { name: "El Maestro Sanador", description: "Vibración compasiva extrema. Influencia transformadora pura. Naces para elevar la conciencia de otros." },
};

function calculateLifePath(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(() => {
    const stored = localStorage.getItem("arithmos_profile");
    return stored ? JSON.parse(stored) : null;
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      const fetchedProfile: Profile = {
        name: data.name,
        birthDate: data.birth_date,
        lifePathNumber: data.life_path_number,
        expressionNumber: data.expression_number || undefined,
        soulUrgeNumber: data.soul_urge_number || undefined,
        personalityNumber: data.personality_number || undefined,
        maturityNumber: data.maturity_number || undefined,
        archetype: data.archetype,
        description: data.archetype_description || "",
        narrative: data.narrative || undefined,
        powerStrategy: data.power_strategy || undefined,
        shadowWork: data.shadow_work || undefined,
        createdAt: data.created_at
      };
      setProfile(fetchedProfile);
      localStorage.setItem("arithmos_profile", JSON.stringify(fetchedProfile));
      return fetchedProfile;
    }
    return null;
  }, []);

  const createProfile = useCallback(async (name: string, birthDate: string, userId?: string) => {
    let newProfile: Profile;
    try {
      const response = await fetch("https://n8n-n8n.z3tydl.easypanel.host/webhook/arithmos-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, birth_date: birthDate })
      });

      let data = await response.json();

      // n8n can return array
      if (Array.isArray(data)) data = data[0];

      let lifePathNumber = calculateLifePath(birthDate);
      let expressionNumber, soulUrgeNumber, personalityNumber, maturityNumber;
      let narrative, powerStrategy, shadowWork;

      if (data && data.success && data.blueprint) {
        lifePathNumber = data.blueprint.life_path_number;
        expressionNumber = data.blueprint.expression_number;
        soulUrgeNumber = data.blueprint.soul_urge_number;
        personalityNumber = data.blueprint.personality_number;
        maturityNumber = data.blueprint.maturity_number;

        // Fase 2: Extraer la interpretación narrativa
        if (data.interpretation) {
          narrative = data.interpretation.narrative;
          powerStrategy = data.interpretation.power_strategy;
          shadowWork = data.interpretation.shadow_work;
        }
      }

      const arch = ARCHETYPES[lifePathNumber] || ARCHETYPES[1];
      newProfile = {
        name,
        birthDate,
        lifePathNumber,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        maturityNumber,
        archetype: arch.name,
        description: arch.description,
        narrative,
        powerStrategy,
        shadowWork,
        createdAt: new Date().toISOString(),
      };

      if (userId) {
        // Verificar que haya sesión activa antes de escribir en Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Guardar/Actualizar Perfil en Supabase
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              name: name,
              birth_date: birthDate,
              life_path_number: lifePathNumber,
              expression_number: expressionNumber,
              soul_urge_number: soulUrgeNumber,
              personality_number: personalityNumber,
              maturity_number: maturityNumber,
              archetype: arch.name,
              archetype_description: arch.description,
              narrative: narrative || null,
              power_strategy: powerStrategy || null,
              shadow_work: shadowWork || null,
            });

          if (!upsertError) {
            // Guardar Lectura Inicial solo si el perfil se guardó correctamente
            await supabase
              .from('readings')
              .insert({
                user_id: userId,
                title: `Blueprint de ${name}`,
                type: 'mini_blueprint',
                metadata: data.blueprint || { life_path_number: lifePathNumber }
              });
          } else {
            console.warn("No se pudo guardar en Supabase, continúando con datos locales:", upsertError.message);
          }
        } else {
          // Sin sesión activa → solo localStorage (Anonymous Auth no disponible o desactivado)
          console.info("Sin sesión Supabase activa. Perfil guardado solo localmente.");
        }
      }

    } catch (error) {
      console.error("Error conectando al motor n8n:", error);
      const lifePathNumber = calculateLifePath(birthDate);
      const arch = ARCHETYPES[lifePathNumber] || ARCHETYPES[1];
      newProfile = {
        name,
        birthDate,
        lifePathNumber,
        archetype: arch.name,
        description: arch.description,
        createdAt: new Date().toISOString(),
      };
    }

    localStorage.setItem("arithmos_profile", JSON.stringify(newProfile));
    setProfile(newProfile);
    return newProfile;
  }, []);

  return { profile, createProfile, fetchProfile };
}

