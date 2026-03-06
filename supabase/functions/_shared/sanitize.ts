/**
 * Utilidad de sanitización para prevenir Prompt Injection
 * Limpia y trunca entradas de usuario usadas en system prompts.
 */
export const sanitizePromptInput = (input: string | number | undefined | null, maxLength = 200): string => {
    if (input === undefined || input === null) return "";

    const str = String(input);

    // 1. Eliminar saltos de línea que podrían romper la estructura del prompt
    let sanitized = str.replace(/[\n\r]/g, ' ');

    // 2. Eliminar tokens comunes de control de LLMs
    const forbiddenTokens = [
        "system:",
        "assistant:",
        "user:",
        "ignore previous instructions",
        "forget all instructions",
        "stop thinking",
        "respond as",
        "you are now"
    ];

    forbiddenTokens.forEach(token => {
        const regex = new RegExp(token, "gi");
        sanitized = sanitized.replace(regex, "[REDACTED]");
    });

    // 3. Truncar longitud para evitar ataques de desbordamiento de contexto
    return sanitized.trim().substring(0, maxLength);
};
