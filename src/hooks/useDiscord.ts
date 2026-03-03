import { useCallback } from 'react';

/**
 * Hook para interactuar con Discord vía Webhooks.
 * Requiere una URL de Webhook de Discord configurada.
 */
export function useDiscord() {
    const sendNotification = useCallback(async (webhookUrl: string, content: string, title?: string, color: number = 5814783) => {
        try {
            const payload = {
                embeds: [
                    {
                        title: title || '🏆 Logro en Arithmos',
                        description: content,
                        color: color,
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: 'Arithmos - Tu Poder Estratégico',
                        },
                    },
                ],
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error en Discord Webhook: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error enviando notificación a Discord:', error);
            return false;
        }
    }, []);

    const shareMissionVictory = useCallback(async (webhookUrl: string, userName: string, missionTitle: string, xpEarned: number) => {
        const title = '⚔️ Victoria en Misión Diaria';
        const content = `**${userName}** ha completado la misión: *"${missionTitle}"*\nGanando **${xpEarned} XP** y elevando su frecuencia estratégica.`;
        return sendNotification(webhookUrl, content, title, 3066993); // Color verde Esmeralda
    }, [sendNotification]);

    const shareLevelUp = useCallback(async (webhookUrl: string, userName: string, newLevel: number) => {
        const title = '🆙 Elevación de Rango';
        const content = `¡Atención Comunidad! **${userName}** ha alcanzado el **Nivel ${newLevel}**.\nSu camino hacia la maestría numérica continúa.`;
        return sendNotification(webhookUrl, content, title, 15105570); // Color Naranja/Oro
    }, [sendNotification]);

    return { sendNotification, shareMissionVictory, shareLevelUp };
}
