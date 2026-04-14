# CLAUDE.md — Arithmos Blueprint

## Agent Rules

1. Think before acting. Read existing files before writing code.
2. Be concise in output but thorough in reasoning.
3. Prefer editing over rewriting whole files.
4. Do not re-read files you have already read unless the file may have changed.
5. Test your code before declaring done.
6. No sycophantic openers or closing fluff.
7. Keep solutions simple and direct.
8. User instructions always override this file.

---

## Project

**Arithmos AI Strategist** — V-SaaS numerología estratégica para LATAM + hispanos EE.UU.

- **ICP:** Estratega Consciente, 30–50 años.
- **Model:** Reverse Trial 14–30d → Freemium → Pro $9.99/mes · Deep Dive $25 · Team $49/mes
- **Deploy:** PWA web + Android TWA (Google Play beta) · iOS Fase 2
- **Design:** Dark mode. Palette `#0D0C14` / oro / violeta / teal. Georgia + sans. No gradients.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Edge Functions | Deno (Supabase Edge Functions) |
| AI | Anthropic Claude API (primary) · OpenAI (fallback) |
| Automation | n8n (AI narrative generation via `syncBlueprintIA`) |
| Payments | Stripe |
| Mobile | Android TWA (`android_twa/`) |

---

## Project Structure

```
arithmos-blueprint/
├── CLAUDE.md                   # This file
├── README.md
├── index.html                  # Vite entry point
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
│
├── src/                        # React frontend
│   ├── App.tsx                 # Router + global providers
│   ├── main.tsx
│   ├── index.css               # Global styles + design tokens
│   ├── pages/                  # Route-level components (one per route)
│   │   ├── Dashboard.tsx       # Main app screen
│   │   ├── Register.tsx        # Onboarding + Aha Moment
│   │   ├── CoachChat.tsx       # Brave Path Coach (Premium)
│   │   ├── DeepDive.tsx        # Annual report (Premium)
│   │   ├── FrictionRadar.tsx   # Shadow diagnosis
│   │   ├── RadarEquipo.tsx     # Team numerology (Premium)
│   │   ├── AdminDashboard.tsx  # Admin panel
│   │   └── ...
│   ├── components/
│   │   ├── ui/                 # shadcn primitives — do not edit
│   │   ├── admin/              # Admin panel tabs
│   │   ├── chat/               # Chat message components
│   │   └── *.tsx               # Feature components
│   ├── hooks/
│   │   ├── useAuth.ts          # Supabase auth session
│   │   ├── useProfile.ts       # Profile + numerology calc (frontend copy)
│   │   ├── useSubscription.ts  # Trial/Pro gate — source of truth for access
│   │   ├── useCoachSession.ts  # Coach chat + session persistence
│   │   └── ...
│   ├── lib/
│   │   ├── archetypes.ts       # Frontend archetype context map (12 archetypes)
│   │   └── utils.ts            # shadcn utility (cn)
│   ├── integrations/supabase/
│   │   ├── client.ts           # Supabase client + SUPABASE_URL export
│   │   └── types.ts            # Generated DB types
│   └── test/                   # Vitest tests
│
├── supabase/
│   ├── config.toml
│   ├── migrations/             # Ordered SQL migrations (apply in sequence)
│   └── functions/
│       ├── deno.json           # Import map (Anthropic + OpenAI SDKs)
│       ├── _shared/            # Shared Deno modules
│       │   ├── archetypes.ts   # 12-archetype knowledge base (Deno)
│       │   ├── numerology.ts   # Pythagorean math (Deno)
│       │   ├── prompts.ts      # Brave Path Coach prompt builder
│       │   ├── cors.ts         # Allowed origins list
│       │   ├── sanitize.ts     # Input sanitization
│       │   └── token-tracker.ts# Token cost logging
│       ├── calculate-blueprint/ # name+birthDate → numerology profile
│       ├── chat-coach/         # Streaming coach (Claude primary / GPT fallback)
│       ├── generate-deep-dive-pdf/
│       ├── create-checkout-session/
│       ├── create-portal-session/
│       └── stripe-webhook/
│
├── docs/
│   ├── plans/                  # Implementation plans (step-by-step)
│   └── specs/                  # Design specs and architecture decisions
│
├── scripts/
│   └── run_sql.js              # Utility: run SQL against Supabase
│
├── android_twa/                # Android TWA (Trusted Web Activity)
│   ├── twa-manifest.json
│   ├── android.keystore        # Release keystore (keep secret)
│   └── app/
│
├── .agents/                    # Agent Brain & Skills
│   ├── skills/                 # Pre-installed standard skills
│   ├── skills-library/         # New high-performance skills (V2.5)
│   │   ├── development-core.md
│   │   ├── infrastructure-security.md
│   │   ├── ux-design-patterns.md
│   │   └── memory-intelligence.md
│   └── superpowers/            # Advanced agent capabilities
│
└── public/                     # Static assets (PWA icons, manifest)
```

> **Note:** `android.keystore` exists both at root and inside `android_twa/`. The root copy is a stale duplicate — use `android_twa/android.keystore` as authoritative.

---

## Key Conventions

### Skills Usage
- Always check `/.agents/skills-library/` before starting a new complex task.
- Use `gsd-planner` for planning mode and `vibe-kanban` for execution tracking.
- Use `ux-authority` for frontend edits and `cyber-safety` for Edge Function edits.

### Premium Access
Access is gated by `useSubscription` (reads `subscriptions` table), **not** `profile.role`.
- `plan = 'trial'` + `trial_ends_at > now()` → full access
- `plan = 'pro'` → full access
- `profile.role = 'admin'` → full access (override)

### Numerology Math
- Frontend: `src/hooks/useProfile.ts` — used by Dashboard components
- Backend: `supabase/functions/_shared/numerology.ts` — used by Edge Functions
- Both must stay in sync. If you fix a calculation bug, fix it in both places.

### AI Provider Switching
Admin selects model in **Admin → IA & Configuración** → saved to `system_prompts.model_id`.
- `gpt-*` prefix → OpenAI SDK
- `claude-*` prefix → Anthropic SDK
- Change takes effect immediately, no redeploy needed.

### Edge Function Deploy
```bash
npx supabase functions deploy <function-name>
```

### Database Migrations
Never edit existing migration files. Always create a new one:
```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

---

## Environment Variables

### Frontend (`.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLIC_KEY=
VITE_STRIPE_PRICE_ID=
```

### Supabase Secrets (set via `npx supabase secrets set KEY=value`)
```
ANTHROPIC_API_KEY=     # Primary AI provider
OPENAI_API_KEY=        # Fallback AI provider
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Common Commands

```bash
npm run dev          # Start dev server
npm test             # Run Vitest
npx tsc --noEmit     # TypeScript check

# Deploy Edge Functions
npx supabase functions deploy calculate-blueprint
npx supabase functions deploy chat-coach

# Run Deno tests
cd supabase/functions
~/.deno/bin/deno test _shared/archetypes.test.ts
~/.deno/bin/deno test _shared/numerology.test.ts
~/.deno/bin/deno test _shared/prompts.test.ts
```

---

## Phase 1 Checklist

- [x] Supabase Schema V2
- [x] Onboarding V2 + Register
- [x] System Prompt Maestro (archetypes, numerology, prompts, calculate-blueprint, chat-coach → Claude)
- [x] Multi-provider AI (Claude primary / OpenAI fallback, admin-configurable)
- [x] Admin Command Center (Telemetry, AI Auditing, PLG Trial Overrides)
- [ ] TWA audit (Digital Asset Links, manifest, Lighthouse >90)
- [ ] n8n calculation engine (5 base numbers, 100% precision)
- [ ] Automated Retention Flows (n8n hooks for trial expiration)
- [ ] Branch strategy (main=prod, develop=features)
- [ ] Update README
