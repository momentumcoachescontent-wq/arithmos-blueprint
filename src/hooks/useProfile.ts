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
  audioUrl?: string;
  role?: "freemium" | "premium" | "admin";
  // Monetización Stripe
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: "active" | "past_due" | "cancelled" | "inactive";
  createdAt: string;
  id: string; // ID de Supabase
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

const PYTHAGOREAN_TABLE: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function sumDigits(num: number): number {
  return num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
}

function reduceToSingleDigitOrMaster(num: number): number {
  const masters = [11, 22, 33];
  let current = num;
  while (current > 9 && !masters.includes(current)) {
    current = sumDigits(current);
  }
  return current;
}

function calculateNameValue(nameStr: string, type: 'all' | 'vowels' | 'consonants' = 'all'): number {
  let sum = 0;
  const chars = nameStr.toLowerCase().replace(/[^a-z]/g, '').split('');
  for (const char of chars) {
    const isVowel = VOWELS.includes(char);
    if (type === 'all' || (type === 'vowels' && isVowel) || (type === 'consonants' && !isVowel)) {
      sum += PYTHAGOREAN_TABLE[char] || 0;
    }
  }
  return sum;
}

function calculateLifePath(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;
  const yearReduced = reduceToSingleDigitOrMaster(parseInt(parts[0]));
  const monthReduced = reduceToSingleDigitOrMaster(parseInt(parts[1]));
  const dayReduced = reduceToSingleDigitOrMaster(parseInt(parts[2]));
  return reduceToSingleDigitOrMaster(yearReduced + monthReduced + dayReduced);
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
      const name = (data as any).name || (data as any).full_name || "Buscador";
      const birthDate = data.birth_date;
      const lifePathNumber = data.life_path_number;

      const fetchedProfile: Profile = {
        name,
        birthDate,
        lifePathNumber,
        expressionNumber: data.expression_number || undefined,
        soulUrgeNumber: data.soul_urge_number || undefined,
        personalityNumber: data.personality_number || undefined,
        maturityNumber: data.maturity_number || undefined,
        archetype: data.archetype,
        description: data.archetype_description || "",
        narrative: data.narrative || undefined,
        powerStrategy: data.power_strategy || undefined,
        shadowWork: data.shadow_work || undefined,
        audioUrl: data.audio_url || undefined,
        role: (data.role as "freemium" | "premium" | "admin") || "freemium",
        createdAt: data.created_at,
        id: data.id
      };

      // --- SMART REPAIR ---
      // Si faltan números pero tenemos nombre/fecha, repararlos localmente y en DB
      if (!fetchedProfile.expressionNumber || !fetchedProfile.soulUrgeNumber || !fetchedProfile.personalityNumber || !fetchedProfile.maturityNumber) {
        fetchedProfile.expressionNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, 'all'));
        fetchedProfile.soulUrgeNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, 'vowels'));
        fetchedProfile.personalityNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, 'consonants'));
        fetchedProfile.maturityNumber = reduceToSingleDigitOrMaster(lifePathNumber + (fetchedProfile.expressionNumber || 0));

        // Background update to fix DB record
        supabase.from('profiles').update({
          expression_number: fetchedProfile.expressionNumber,
          soul_urge_number: fetchedProfile.soulUrgeNumber,
          personality_number: fetchedProfile.personalityNumber,
          maturity_number: fetchedProfile.maturityNumber
        }).eq('user_id', userId).then(({ error }) => {
          if (error) console.warn("Auto-reparación falló en DB:", error.message);
        });
      }

      setProfile({ ...fetchedProfile });
      localStorage.setItem("arithmos_profile", JSON.stringify(fetchedProfile));
      return fetchedProfile;
    }
    return null;
  }, []);

  const createProfile = useCallback(async (name: string, birthDate: string, userId?: string) => {
    // 1. Cálculos Deterministas Locales (Respaldo Inmediato)
    const lifePathNumber = calculateLifePath(birthDate);
    const expressionNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, 'all'));
    const soulUrgeNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, 'vowels'));
    const personalityNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, 'consonants'));
    const maturityNumber = reduceToSingleDigitOrMaster(lifePathNumber + expressionNumber);

    const arch = ARCHETYPES[lifePathNumber] || ARCHETYPES[1];

    let newProfile: Profile = {
      name,
      birthDate,
      lifePathNumber,
      expressionNumber,
      soulUrgeNumber,
      personalityNumber,
      maturityNumber,
      archetype: arch.name,
      description: arch.description,
      createdAt: new Date().toISOString(),
      id: profile?.id || "",
    };

    try {
      // 2. Intentar obtener interpretación IA de n8n
      const response = await fetch("https://n8n-n8n.z3tydl.easypanel.host/webhook/arithmos-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, birth_date: birthDate })
      });

      if (response.ok) {
        let data = await response.json();
        if (Array.isArray(data)) data = data[0];

        if (data && data.success && data.interpretation) {
          newProfile.narrative = data.interpretation.narrative;
          newProfile.powerStrategy = data.interpretation.power_strategy;
          newProfile.shadowWork = data.interpretation.shadow_work;
          newProfile.audioUrl = data.interpretation.audio_url;
        }
      }
    } catch (error) {
      console.warn("Fallo en motor IA (n8n), se usarán solo datos matemáticos locales:", error);
    }

    // 3. Persistencia en LocalStorage y actualización de ESTADO reactivo
    localStorage.setItem("arithmos_profile", JSON.stringify(newProfile));
    setProfile({ ...newProfile }); // Clonar para forzar re-render

    if (userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
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
            narrative: newProfile.narrative || null,
            power_strategy: newProfile.powerStrategy || null,
            shadow_work: newProfile.shadowWork || null,
            audio_url: newProfile.audioUrl || null,
          }, { onConflict: 'user_id' }); // Usar user_id como target de conflicto si id es desconocido

        if (!upsertError) {
          await supabase
            .from('readings')
            .upsert({
              user_id: userId,
              title: `Blueprint de ${name}`,
              type: 'mini_blueprint',
              metadata: {
                life_path_number: lifePathNumber,
                expression_number: expressionNumber,
                soul_urge_number: soulUrgeNumber,
                personality_number: personalityNumber,
                maturity_number: maturityNumber
              }
            }, { onConflict: 'user_id,type' });
        }
      }
    }
    return newProfile;
  }, []);

  const syncBlueprintIA = useCallback(async () => {
    if (!profile) return;

    try {
      const response = await fetch("https://n8n-n8n.z3tydl.easypanel.host/webhook/arithmos-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: profile.name, birth_date: profile.birthDate })
      });

      if (response.ok) {
        let data = await response.json();
        if (Array.isArray(data)) data = data[0];

        if (data && data.success && data.interpretation) {
          const updatedProfile = {
            ...profile,
            narrative: data.interpretation.narrative,
            powerStrategy: data.interpretation.power_strategy,
            shadowWork: data.interpretation.shadow_work,
            audioUrl: data.interpretation.audio_url,
          };

          setProfile({ ...updatedProfile });
          localStorage.setItem("arithmos_profile", JSON.stringify(updatedProfile));

          await supabase.from('profiles').update({
            narrative: updatedProfile.narrative,
            power_strategy: updatedProfile.powerStrategy,
            shadow_work: updatedProfile.shadowWork,
            audio_url: updatedProfile.audioUrl,
          }).eq('id', profile.id);

          return updatedProfile;
        }
      }
    } catch (error) {
      console.error("Error sincronizando IA:", error);
    }
    return null;
  }, [profile]);

  return { profile, createProfile, fetchProfile, syncBlueprintIA };
}

