# Arithmos AI Strategist

V-SaaS de numerología estratégica para LATAM + hispanos EE.UU. Combina matemática Pythagorean determinista con IA (Claude API) para entregar guía estratégica personalizada por arquetipo y ciclo numerológico.

**Deploy:** PWA web + Android TWA (Google Play beta) · iOS Fase 2  
**Modelo:** Reverse Trial 14d → Freemium → Pro $9.99/mes · Deep Dive $25 · Team $49/mes  
**ICP:** Estratega Consciente · 30–50 años · LATAM + hispanos EE.UU.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + RLS + Storage) |
| Edge Functions | Deno (Supabase Edge Functions) |
| IA | Anthropic Claude API (primary) · OpenAI (fallback) |
| Automatización | n8n |
| Pagos | Stripe |
| Mobile | Android TWA (`android_twa/`) |

---

## Setup local

**Requisitos:** Node.js 18+, npm, Deno (`~/.deno/bin/deno`)

```bash
# 1. Clonar
git clone https://github.com/momentumcoachescontent-wq/arithmos-blueprint.git
cd arithmos-blueprint

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver sección Variables de entorno)

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## Variables de entorno

### Frontend (`.env`)

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_STRIPE_PRICE_ID=price_...
```

### Supabase Secrets

Configurar via `npx supabase secrets set KEY=value` o en el dashboard de Supabase:

```
ANTHROPIC_API_KEY=sk-ant-...     # Proveedor IA primario
OPENAI_API_KEY=sk-...            # Proveedor IA fallback
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Comandos frecuentes

```bash
# Desarrollo
npm run dev              # Servidor local con hot reload
npm test                 # Tests unitarios (Vitest)
npx tsc --noEmit         # Verificación TypeScript

# Edge Functions
npx supabase functions deploy calculate-blueprint
npx supabase functions deploy chat-coach

# Tests Deno (shared modules)
cd supabase/functions
~/.deno/bin/deno test _shared/archetypes.test.ts
~/.deno/bin/deno test _shared/numerology.test.ts
~/.deno/bin/deno test _shared/prompts.test.ts

# Migraciones
# Nunca editar migraciones existentes.
# Crear nueva: supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

---

## Arquitectura

```
arithmos-blueprint/
├── src/
│   ├── pages/              # Rutas principales
│   │   ├── Dashboard.tsx   # Shell con 4 tabs (Hoy/Mapa/Explorar/Yo)
│   │   ├── Register.tsx    # Onboarding + cálculo de blueprint
│   │   ├── CoachChat.tsx   # Brave Path Coach (Premium)
│   │   ├── CalendarioNumerico.tsx  # Calendario de números personales
│   │   ├── HorasDelDia.tsx         # Vibraciones por hora
│   │   └── ...
│   ├── components/
│   │   ├── tabs/           # HoyTab, MapaTab, HerramientasTab, YoTab
│   │   ├── BottomNav.tsx   # Navegación inferior 4 tabs
│   │   ├── MovimientoDelDia.tsx    # Carta central diaria
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.ts      # Sesión Supabase
│   │   ├── useProfile.ts   # Perfil + cálculo numerológico
│   │   ├── useSubscription.ts  # Acceso trial/pro (fuente de verdad)
│   │   ├── useStreak.ts    # Racha diaria
│   │   └── ...
│   └── lib/
│       └── archetypes.ts   # 12 arquetipos con powers/shadow/coachingNote
│
├── supabase/
│   ├── functions/
│   │   ├── _shared/        # archetypes.ts, numerology.ts, prompts.ts
│   │   ├── calculate-blueprint/    # name+birthDate → perfil numérico
│   │   ├── chat-coach/             # Coach streaming (Claude/OpenAI)
│   │   └── ...
│   └── migrations/         # SQL ordenado cronológicamente
│
├── docs/
│   ├── plans/              # Planes de implementación paso a paso
│   └── specs/              # Specs de diseño y arquitectura
│
├── scripts/
│   └── run_sql.js          # Utilidad: ejecutar SQL contra Supabase
│
└── android_twa/            # Android Trusted Web Activity (Google Play)
    ├── twa-manifest.json
    └── android.keystore    # Keystore de release (mantener secreto)
```

---

## Acceso premium

El acceso a features premium se controla **exclusivamente** via `useSubscription` (tabla `subscriptions`), no por `profile.role`.

| Condición | Acceso |
|-----------|--------|
| `plan = 'trial'` + `trial_ends_at > now()` | ✅ Completo |
| `plan = 'pro'` | ✅ Completo |
| `profile.role = 'admin'` | ✅ Override total |
| Trial expirado sin pago | ❌ Bloqueado |

---

## Proveedor de IA

El administrador selecciona el modelo en **Admin → IA & Configuración**. Se guarda en `system_prompts.model_id` y toma efecto de inmediato sin redeploy.

- Prefijo `claude-*` → Anthropic SDK
- Prefijo `gpt-*` / `o1` / `o3` → OpenAI SDK

Modelos configurados por defecto:
- `coach_chat` → `claude-sonnet-4-6`
- `coach_summarize` → `claude-haiku-4-5-20251001`

---

## Navegación (4 tabs)

| Tab | Ruta | Pregunta que responde |
|-----|------|-----------------------|
| Hoy | `/dashboard` (default) | ¿Qué hago ahora? |
| Mapa | tab interno | ¿Quién soy dentro del sistema? |
| Explorar | tab interno | ¿Qué quiero explorar? |
| Yo | tab interno | ¿Cómo administro mi experiencia? |

Loop central: **Pulso → Acción → Reflexión → Progreso**
