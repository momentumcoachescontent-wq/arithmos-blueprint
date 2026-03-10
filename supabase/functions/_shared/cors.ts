export const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Origen dinámico manejado por la función si se desea más rigor, pero para Supabase Functions muchas veces se usa * con validación de API Key. 
    // Sin embargo, para cumplir con el blindaje estructural, restringiremos a una lista blanca en el manejador si es necesario.
    // Por ahora, para evitar bloqueos, permitiremos los dominios específicos en la respuesta.
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper para validar orígenes permitidos
export const getSafeCorsHeaders = (req: Request) => {
    const origin = req.headers.get("origin");
    const allowedOrigins = [
        "https://app.arithmos.mx",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://lovable.dev",             // Editor de Lovable
        "https://arithmos-blueprint.lovable.app", // Preview de Lovable
        "https://preview--arithmos-blueprint.lovable.app", // Preview alternativo
    ];

    const headers = { ...corsHeaders };
    if (origin && allowedOrigins.includes(origin)) {
        headers["Access-Control-Allow-Origin"] = origin;
    } else {
        headers["Access-Control-Allow-Origin"] = "https://app.arithmos.mx";
    }
    return headers;
};
