# Onboarding V2 — Design Spec
**Date:** 2026-04-07
**Project:** Arithmos Blueprint · Plan Maestro V2.1
**Status:** Approved

---

## Context

The current app has a fragmented registration flow: `Index.tsx` shows a landing with hero image, `AuthModal.tsx` handles both login and registration, and `Onboarding.tsx` collects name/date/phone after anonymous auth. This creates unnecessary steps, exposes anonymous auth, and delays the "Aha Moment" (seeing your numerology number).

V2 goal: user lands → registers → sees their number in under 60 seconds. Single focused page, no scroll, dark aesthetic.

---

## Business Model Alignment

- All new users start with **30-day Premium trial** (no credit card required)
- Landing must communicate this clearly to remove signup friction
- The Aha Moment is the payoff for registering — it must be immediate and emotionally impactful

---

## Architecture

### Routing Changes

| Route | Before | After |
|-------|--------|-------|
| `/` | `Index.tsx` (hero + sections) | `Index.tsx` (single screen, rebuilt) |
| `/register` | — (did not exist) | `Register.tsx` (new) |
| `/onboarding` | `Onboarding.tsx` | Deleted — redirects to `/dashboard` (or remove entirely) |

### New components
- `src/pages/Register.tsx` — two UI states: `form` \| `aha`
- `src/components/AhaMoment.tsx` — number reveal UI

### Deleted components
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/ValueProposition.tsx`
- `src/components/landing/PricingSection.tsx`
- `src/components/landing/Footer.tsx`
- `src/pages/Onboarding.tsx`

---

## Section 1: Landing Page (`/`)

**File:** `src/pages/Index.tsx` — full rebuild

**Layout:** Single screen. No scroll. Background `#0D0C14`. No hero image.

### Navbar
- Left: `✦ Arithmos` (Georgia serif, `#e8e8e8`)
- Right: "Iniciar Sesión" link (opens `AuthModal`)
- Bottom border: `1px solid #1e1c2e`

### Hero (centered)
All content centered, `text-align: center`.

1. **Badge** — `"30 días Premium · Sin tarjeta de crédito"` — uppercase, `letter-spacing: 0.4em`, color `#B8860B`
2. **Headline** — `"¿Operas a favor de tu ciclo natural, o en su contra?"` — Georgia serif, ~24px, `#e8e8e8`
3. **Subheadline** — `"Numerología determinista aplicada a decisiones de alto impacto. Tu Blueprint personal en 60 segundos."` — sans-serif, ~12px, `#777`
4. **CTA button** — `"Descubrir mi Blueprint →"` — background `#D4AF37`, text `#0D0C14`, bold, links to `/register`
5. **Trust signal** — `"✓ Sin tarjeta · 30 días completos · Sin compromiso"` — 10px, `#555`

No other sections. No footer. No scroll.

---

## Section 2: Registration Page (`/register`)

**File:** `src/pages/Register.tsx`

This page has **two UI states** managed by local state (`'form' | 'aha'`). No navigation between them — the state transitions automatically after successful registration.

### State: `form`

**Navbar:** Same as landing — `✦ Arithmos` left, `"¿Ya tienes cuenta? Iniciar Sesión"` right (opens AuthModal).

**Header:**
- Badge: `"30 días Premium gratis"` — `#B8860B` uppercase
- Headline: `"Crea tu Blueprint"` — Georgia serif

**Form fields (4, linear, full width, max-width 260px):**
1. Nombre (text)
2. Fecha de nacimiento (date)
3. Email
4. Contraseña (password)

**CTA:** `"Calcular mi Blueprint →"` — `#D4AF37` background, `#0D0C14` text, bold

**Trust signal:** `"✓ Sin tarjeta de crédito · Sin compromiso"` — 9px, `#555`

**On submit:**
1. Create Supabase auth user (email + password)
2. Call `createProfile` with name, birth_date, email → computes life_path_number, archetype, archetype_description
3. Insert row into `subscriptions` (plan = 'trial', trial_ends_at = now + 30 days)
4. Transition to state `'aha'`

### State: `aha`

Rendered by `<AhaMoment />` component. No navbar.

**Component:** `src/components/AhaMoment.tsx`

**Layout:** Centered, full screen, subtle radial gold glow (`rgba(212,175,55,0.07)`).

**Content (top to bottom):**
1. Label: `"Tu Camino de Vida"` — 9px uppercase, `#B8860B`, `letter-spacing: 0.4em`
2. **Number:** Life Path Number — 88px, Georgia serif bold, `#D4AF37`, subtle text-shadow glow
3. **Archetype name:** e.g. `"El Analista Profundo"` — 20px Georgia serif italic, `#e8e8e8`
4. **Divider:** 36px wide, 1px, `#D4AF37`, `opacity: 0.35`
5. **Description:** `archetype_description` (from profile) — 12px sans-serif, `#888`, max-width 220px, line-height 1.6
6. **CTA:** `"Ver mi Dashboard →"` — `#D4AF37` bg, `#0D0C14` text, bold — navigates to `/dashboard`

**Props:**
```typescript
interface AhaMomentProps {
  lifePathNumber: number;
  archetype: string;
  archetypeDescription: string;
}
```

---

## Section 3: AuthModal (Login Only)

**File:** `src/components/AuthModal.tsx`

Remove the "Crear Cuenta" tab entirely. The modal renders only the login form.

**Login form:**
- Email field
- Password field
- `"Iniciar Sesión"` submit button
- Link: `"¿No tienes cuenta? Crear una gratis"` → navigates to `/register`, closes modal

No tabs. No registration fields. No anonymous auth logic.

---

## Section 4: Profile Editing

**No dedicated route.** Profile editing is a modal (shadcn/ui `Sheet`) launched from within the dashboard.

**Fields:** Nombre, Fecha de nacimiento, Teléfono (optional)

**Note:** Changing birth_date must recompute numerology numbers. The sheet triggers `syncBlueprintIA` after save.

**AuthModal availability:** `AuthModal` is already a global component rendered in `App.tsx` (or a layout wrapper). It should remain global so both `Index.tsx` and `Register.tsx` can open it via shared state (e.g., `useAuthModal` context or a simple boolean state lifted to the router).

`Onboarding.tsx` is deleted. Any existing links to `/onboarding` should redirect to `/dashboard`.

---

## Section 5: App Router Changes

**File:** `src/App.tsx`

- Add route: `<Route path="/register" element={<Register />} />`
- Remove route: `<Route path="/onboarding" element={<Onboarding />} />`
- Add redirect: `<Route path="/onboarding" element={<Navigate to="/dashboard" />} />`

---

## Section 6: Hook Changes

**File:** `src/hooks/useProfile.ts`

- `createProfile` must no longer redirect to `/onboarding` after creating a profile
- `createProfile` returns the created profile data (life_path_number, archetype, archetype_description) so `Register.tsx` can pass them to `<AhaMoment />`

---

## Change Summary

| Action | File |
|--------|------|
| Rebuild | `src/pages/Index.tsx` |
| Create | `src/pages/Register.tsx` |
| Create | `src/components/AhaMoment.tsx` |
| Modify | `src/components/AuthModal.tsx` |
| Modify | `src/App.tsx` |
| Modify | `src/hooks/useProfile.ts` |
| Delete | `src/pages/Onboarding.tsx` |
| Delete | `src/components/landing/HeroSection.tsx` |
| Delete | `src/components/landing/ValueProposition.tsx` |
| Delete | `src/components/landing/PricingSection.tsx` |
| Delete | `src/components/landing/Footer.tsx` |

---

## Out of Scope

- Dashboard redesign (separate spec)
- Profile edit modal implementation (can follow this spec)
- Stripe/MercadoPago checkout flow
- Email verification flow
- Password reset flow
