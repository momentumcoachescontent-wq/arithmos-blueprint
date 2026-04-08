import { useState, useCallback } from "react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  userId: string;          // was: id (profiles.user_id is now the PK)
  name: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber?: number;
  soulUrgeNumber?: number;
  personalityNumber?: number;
  personalYearNumber?: number;
  archetype: string;
  description: string;
  narrative?: string;
  powerStrategy?: string;
  shadowWork?: string;
  audioUrl?: string;
  phone?: string;
  role?: "user" | "admin";
  onboardingCompletedAt?: string;
  createdAt: string;
}

export const ARCHETYPES: Record<number, { name: string; description: string }> = {
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

export function sumDigits(num: number): number {
  return num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
}

export function reduceToSingleDigitOrMaster(num: number): number {
  const masters = [11, 22, 33];
  let current = num;
  while (current > 9 && !masters.includes(current)) {
    current = sumDigits(current);
  }
  return current;
}

export function calculateNameValue(nameStr: string, type: 'all' | 'vowels' | 'consonants' = 'all'): number {
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

export function calculateLifePath(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;
  const yearReduced = reduceToSingleDigitOrMaster(parseInt(parts[0]));
  const monthReduced = reduceToSingleDigitOrMaster(parseInt(parts[1]));
  const dayReduced = reduceToSingleDigitOrMaster(parseInt(parts[2]));
  return reduceToSingleDigitOrMaster(yearReduced + monthReduced + dayReduced);
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(() => {
    const stored = sessionStorage.getItem("arithmos_profile");
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
        userId: data.user_id,
        name: data.name,
        birthDate: data.birth_date,
        lifePathNumber: data.life_path_number,
        expressionNumber: data.expression_number ?? undefined,
        soulUrgeNumber: data.soul_urge_number ?? undefined,
        personalityNumber: data.personality_number ?? undefined,
        personalYearNumber: data.personal_year_number ?? undefined,
        archetype: data.archetype,
        description: data.archetype_description ?? "",
        narrative: data.narrative ?? undefined,
        powerStrategy: data.power_strategy ?? undefined,
        shadowWork: data.shadow_work ?? undefined,
        audioUrl: data.audio_url ?? undefined,
        role: (data.role as "user" | "admin") ?? "user",
        phone: data.phone ?? undefined,
        onboardingCompletedAt: data.onboarding_completed_at ?? undefined,
        createdAt: data.created_at,
      };

      // Auto-repair missing computed numbers
      if (!fetchedProfile.expressionNumber || !fetchedProfile.soulUrgeNumber || !fetchedProfile.personalityNumber) {
        fetchedProfile.expressionNumber = reduceToSingleDigitOrMaster(calculateNameValue(fetchedProfile.name, 'all'));
        fetchedProfile.soulUrgeNumber = reduceToSingleDigitOrMaster(calculateNameValue(fetchedProfile.name, 'vowels'));
        fetchedProfile.personalityNumber = reduceToSingleDigitOrMaster(calculateNameValue(fetchedProfile.name, 'consonants'));

        supabase.from('profiles').update({
          expression_number: fetchedProfile.expressionNumber,
          soul_urge_number: fetchedProfile.soulUrgeNumber,
          personality_number: fetchedProfile.personalityNumber,
        }).eq('user_id', userId).then(({ error }) => {
          if (error) console.warn("Auto-reparación falló en DB:", error.message);
        });
      }

      setProfile(fetchedProfile);
      sessionStorage.setItem("arithmos_profile", JSON.stringify(fetchedProfile));
      return fetchedProfile;
    }
    return null;
  }, []);

  const createProfile = useCallback(async (name: string, birthDate: string, userId?: string, phone?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token || SUPABASE_PUBLISHABLE_KEY;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/calculate-blueprint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({ name, birthDate }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(err.error || `calculate-blueprint failed: ${response.status}`);
    }

    const result = await response.json() as {
      lifePathNumber: number;
      expressionNumber: number;
      soulUrgeNumber: number;
      personalityNumber: number;
      archetype: string;
      archetypeDescription: string;
    };

    const newProfile: Profile = {
      userId: userId || "",
      name,
      birthDate,
      lifePathNumber: result.lifePathNumber,
      expressionNumber: result.expressionNumber,
      soulUrgeNumber: result.soulUrgeNumber,
      personalityNumber: result.personalityNumber,
      archetype: result.archetype,
      description: result.archetypeDescription,
      createdAt: new Date().toISOString(),
      phone: phone,
    };

    sessionStorage.setItem("arithmos_profile", JSON.stringify(newProfile));
    setProfile({ ...newProfile });

    if (userId && session) {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: userId,
            name,
            birth_date: birthDate,
            life_path_number: result.lifePathNumber,
            expression_number: result.expressionNumber,
            soul_urge_number: result.soulUrgeNumber,
            personality_number: result.personalityNumber,
            archetype: result.archetype,
            archetype_description: result.archetypeDescription,
            phone: phone ?? null,
          },
          { onConflict: 'user_id' },
        );

      if (upsertError) {
        console.warn("Error upserting profile:", upsertError.message);
      }
    }

    return newProfile;
  }, []);

  const syncBlueprintIA = useCallback(async () => {
    if (!profile) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch("https://n8n-n8n.z3tydl.easypanel.host/webhook/arithmos-calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: profile.name, birth_date: profile.birthDate }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
          sessionStorage.setItem("arithmos_profile", JSON.stringify(updatedProfile));

          await supabase.from('profiles').update({
            narrative: updatedProfile.narrative,
            power_strategy: updatedProfile.powerStrategy,
            shadow_work: updatedProfile.shadowWork,
            audio_url: updatedProfile.audioUrl,
          }).eq('user_id', profile.userId);

          toast.success("Blueprint sincronizado con éxito.");
          return updatedProfile;
        } else {
          toast.error("El servidor de IA no devolvió una interpretación válida.");
        }
      } else {
        toast.error(`Error de conexión con el Oráculo (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Error sincronizando IA:", error);
      toast.error("No se pudo sintonizar con el servidor de IA. Inténtalo más tarde.");
    }
    return null;
  }, [profile]);

  return { profile, createProfile, fetchProfile, syncBlueprintIA };
}

