/**
 * SCRIPT DE DIAGNÓSTICO: STRIPE & EDGE FUNCTIONS
 * Ejecuta este script para identificar dónde está el fallo.
 */
import { supabase } from "@/integrations/supabase/client";

async function runDiagnostic() {
    console.log("🚀 Iniciando diagnóstico...");

    // 1. Validar variables de entorno front
    const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;

    console.log("------- [1. Frontend Env] -------");
    console.log("VITE_STRIPE_PUBLIC_KEY:", publicKey ? "✅ Presente" : "❌ Faltante");
    console.log("VITE_STRIPE_PRICE_ID:", priceId ? "✅ Presente" : "❌ Faltante");

    if (!publicKey || !priceId) {
        console.error("⛔ ERROR: Faltan variables en el cliente. El botón no funcionará.");
    }

    // 2. Probar invocación de Edge Function (Ping simple)
    console.log("\n------- [2. Edge Function Connection] -------");
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: { test_ping: true }
        });

        if (error) {
            console.error("❌ Fallo al contactar la función:", error);
            if (error.message?.includes("404")) console.log("HINT: La función 'create-checkout-session' no parece estar desplegada.");
        } else {
            console.log("✅ Conexión con Edge Function exitosa.");
        }
    } catch (e) {
        console.error("❌ Error de red/cors:", e);
    }

    // 3. Verificación de Secrets en Supabase (Lógica indirecta)
    console.log("\n------- [3. Supabase Secrets Hint] -------");
    console.log("HINT: Si la función responde 'Secret not found', debes configurar STRIPE_SECRET_KEY en el panel de Supabase.");
}

// Puedes pegar este código en la consola del navegador (en tu app) para correrlo.
// runDiagnostic();
