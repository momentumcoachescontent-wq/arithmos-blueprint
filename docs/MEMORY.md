# Arithmos Project Memory — V3 (Cosmic)

## 1. Identidad y Tono (Coach Senior)
- **Arquetipo de IA:** Coach Senior en Psicología Aplicada.
- **Efoque:** Crecimiento post-traumático, resiliencia y transformación de la sombra en poder.
- **Tono:** Confrontación compasiva, directo, incisivo, sin positividad tóxica (MADM: Mente, Alma, Dios, Materia).

## 2. Arquitectura de Engine (V3)
- **Primary AI:** Anthropic Claude Sonnet 4.6 (seleccionado en Admin → IA).
- **Fallback AI:** GPT-4o.
- **Numerología:** Lógica determinista unificada en `supabase/functions/_shared/numerology.ts`.
- **Cosmic Engine (Fase 3)**:
    - `TarotReelsView`: Scroll vertical snap-scroll para micro-lecturas.
    - `find-matches`: Algoritmo de afinidad basado en Camino de Vida y Signos.
    - `CosmicCoordinates`: Captura de Hora y Lugar de nacimiento (Coordenadas exactas para natal chart).

## 3. Capa Social y Datos (V5)
- **Schema `cosmic_interactions`**: 
    - Maneja likes unidireccionales.
    - `is_mutual`: Flag para disparar experiencias de Match.
- **Notificaciones**: Tipos ampliados (`vibe_like`, `cosmic_match`).
- **Telemetry**: Tracking de consumo de tokens por usuario y racha de actividad.

## 4. Diseño y UX (Gen Z Focus)
- **Palette**: `#0D0C14` (Night), Gold, Violet, Teal.
- **Typography**: Georgia (Display) + Sans (UI).
- **Interface**: Glassmorphism extremo, micro-animaciones (Framer Motion), feedback háptico simulado (vibes de audio en Reels).
- **Onboarding V3.2**: Flujo multi-paso (Identidad -> Coordenadas) diseñado para alta conversión y captura de datos de valor.

## 5. Modelo de Negocio (PLG)
- **Reverse Trial**: Acceso total por 14-30 días -> Freemium degradado.
- **Control Admin**: Capacidad de extender/reducir trial y auditoría de "Whales" (alto consumo de tokens).
