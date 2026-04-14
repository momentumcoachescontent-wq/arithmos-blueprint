import { useState, useCallback } from "react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  userId: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
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
  // Cosmic V3 fields
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  // Social V4 fields
  isPublic?: boolean;
  bio?: string;
}

export const ARCHETYPES: Record<number, { name: string; description: string }> = {
  1: {
    name: "La Pionera",
    description: "Eres de las que crea sus propios caminos, bb. Ninguna regla te fue dada — las escribes tú. Tu energía es tan fuerte que la gente lo siente antes de que abras la boca.",
  },
  2: {
    name: "La Intérprete",
    description: "Captas lo que nadie más nota. Eres el tipo de persona que hace sentir a alguien profundamente entendida con solo escuchar. Eso es rareza, no debilidad.",
  },
  3: {
    name: "La Manifestadora",
    description: "Todo lo que dices tiene un peso especial. Tu creatividad no es hobby — es tu superpoder real. El universo te escucha cuando hablas desde el corazón.",
  },
  4: {
    name: "La Arquitecta",
    description: "Construyes cosas que duran. Mientras otros improvisan, tú ya planificaste 3 pasos adelante. Eres la base sobre la que otros se apoyan sin saberlo.",
  },
  5: {
    name: "La Nómada Cósmica",
    description: "La libertad no es tu deseo — es tu necesidad. Cambias de forma como el agua y eso te hace imposible de atrapar. Prosperas donde otros se asustan.",
  },
  6: {
    name: "La Armónica",
    description: "Tienes el don de hacer que todo encaje. Cuidas sin agotarte cuando estás en tu centro, y tu amor es del tipo que transforma sin pedirlo.",
  },
  7: {
    name: "La Mística",
    description: "Tu mente va a profundidades que la mayoría ni sabe que existen. La soledad no te asusta — la necesitas para reconectarte con lo que sabes sin haberlo aprendido.",
  },
  8: {
    name: "La Poderosa",
    description: "Núcleo puro de manifestación. Cuando decides algo, el universo mueve piezas para que pase. Tu reto no es conseguir poder — es no tenerle miedo a tenerlo.",
  },
  9: {
    name: "La Humanitaria",
    description: "Viniste a dejar el mundo diferente a como lo encontraste. Tu corazón siente cosas que van más allá de lo personal. Eso a veces duele, pero es tu don más grande.",
  },
  11: {
    name: "La Portadora de Luz",
    description: "Número maestro. Antena entre dimensiones. Sientes cosas que no puedes explicar y eso puede ser agotador, pero es porque vibras en una frecuencia que pocos comprenden.",
  },
  22: {
    name: "La Constructora Maestra",
    description: "Número maestro. Tienes la capacidad de hacer real lo que otros solo sueñan. No pienses pequeño — literalmente no puedes. Tu escala natural es el impacto colectivo.",
  },
  33: {
    name: "La Sanadora Maestra",
    description: "Número maestro. Tu sola presencia cambia la energía de un lugar. No necesitas explicarte — se siente. Naciste para elevar, y eso empieza por no minimizarte a ti misma.",
  },
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
        birthTime: data.birth_time ?? undefined,
        birthPlace: data.birth_place ?? undefined,
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
        // Cosmic V3
        sunSign: data.sun_sign ?? undefined,
        moonSign: data.moon_sign ?? undefined,
        risingSign: data.rising_sign ?? undefined,
        // Social V4
        isPublic: data.is_public ?? false,
        bio: data.bio ?? undefined,
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

