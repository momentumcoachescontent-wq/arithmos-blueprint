# Onboarding V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the multi-step landing → AuthModal → Onboarding registration flow with a focused `/register` page that shows the user's life path number immediately after account creation.

**Architecture:** Six self-contained tasks executed in order — create new components first, then replace the landing page and simplify AuthModal, then update routing, and delete the old files last so the build stays valid throughout. Each task leaves the project in a buildable state.

**Tech Stack:** React 18, TypeScript, React Router v6, Tailwind CSS, shadcn/ui, Framer Motion, Supabase JS, Vitest + @testing-library/react

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/components/AhaMoment.tsx` |
| Create | `src/test/AhaMoment.test.tsx` |
| Create | `src/pages/Register.tsx` |
| Rebuild | `src/pages/Index.tsx` |
| Simplify | `src/components/AuthModal.tsx` |
| Modify | `src/App.tsx` |
| Delete | `src/pages/Onboarding.tsx` |
| Delete | `src/components/landing/HeroSection.tsx` |
| Delete | `src/components/landing/ValueProposition.tsx` |
| Delete | `src/components/landing/PricingSection.tsx` |
| Delete | `src/components/landing/Footer.tsx` |

---

## Context for all tasks

**Design palette:** background `#0D0C14`, gold `#D4AF37`, gold-dark `#B8860B`, violet `#7c6ed4`, text-primary `#e8e8e8`, text-muted `#888`, border `#1e1c2e`, input-bg `#141222`, input-border `#2a2840`.

**`useProfile.createProfile` signature** (already exists in `src/hooks/useProfile.ts`):
```typescript
createProfile(name: string, birthDate: string, userId?: string, phone?: string): Promise<Profile>
```
It returns a `Profile` object with `lifePathNumber: number`, `archetype: string`, `description: string` (archetype description).

**`Profile` type** (from `src/hooks/useProfile.ts`):
```typescript
interface Profile {
  userId: string;
  name: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber?: number;
  soulUrgeNumber?: number;
  personalityNumber?: number;
  personalYearNumber?: number;
  archetype: string;
  description: string;   // ← archetype description
  narrative?: string;
  powerStrategy?: string;
  shadowWork?: string;
  audioUrl?: string;
  phone?: string;
  role?: "user" | "admin";
  onboardingCompletedAt?: string;
  createdAt: string;
}
```

**Supabase client import:** `import { supabase } from "@/integrations/supabase/client";`

---

## Task 1: Create AhaMoment component

**Files:**
- Create: `src/components/AhaMoment.tsx`
- Create: `src/test/AhaMoment.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/AhaMoment.test.tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AhaMoment } from "@/components/AhaMoment";

const props = {
  lifePathNumber: 7,
  archetype: "El Analista Profundo",
  archetypeDescription: "Pensador penetrante que opera en un nivel de percepción que otros no pueden alcanzar.",
};

describe("AhaMoment", () => {
  it("renders the life path number", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders the archetype name", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByText("El Analista Profundo")).toBeInTheDocument();
  });

  it("renders the archetype description", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByText(props.archetypeDescription)).toBeInTheDocument();
  });

  it("renders the dashboard CTA button", () => {
    render(<MemoryRouter><AhaMoment {...props} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: /ver mi dashboard/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test -- AhaMoment
```

Expected: FAIL — `Cannot find module '@/components/AhaMoment'`

- [ ] **Step 3: Create the component**

```typescript
// src/components/AhaMoment.tsx
import { useNavigate } from "react-router-dom";

interface AhaMomentProps {
  lifePathNumber: number;
  archetype: string;
  archetypeDescription: string;
}

export function AhaMoment({ lifePathNumber, archetype, archetypeDescription }: AhaMomentProps) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative"
      style={{ background: "#0D0C14" }}
    >
      {/* Subtle gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(212,175,55,0.07) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3">
        <p
          className="uppercase font-sans"
          style={{ fontSize: "9px", letterSpacing: "0.4em", color: "#B8860B" }}
        >
          Tu Camino de Vida
        </p>

        <p
          className="font-serif font-bold leading-none"
          style={{
            fontSize: "88px",
            color: "#D4AF37",
            textShadow: "0 0 40px rgba(212,175,55,0.25)",
          }}
        >
          {lifePathNumber}
        </p>

        <p
          className="font-serif italic"
          style={{ fontSize: "20px", color: "#e8e8e8" }}
        >
          {archetype}
        </p>

        <div
          style={{
            width: "36px",
            height: "1px",
            background: "#D4AF37",
            opacity: 0.35,
            margin: "4px 0",
          }}
        />

        <p
          className="font-sans"
          style={{
            fontSize: "12px",
            color: "#888",
            maxWidth: "220px",
            lineHeight: "1.6",
          }}
        >
          {archetypeDescription}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="font-sans font-bold mt-4"
          style={{
            padding: "11px 32px",
            background: "#D4AF37",
            color: "#0D0C14",
            borderRadius: "4px",
            fontSize: "13px",
            cursor: "pointer",
            border: "none",
          }}
        >
          Ver mi Dashboard →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test -- AhaMoment
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/AhaMoment.tsx src/test/AhaMoment.test.tsx
git commit -m "feat: add AhaMoment component with tests"
```

---

## Task 2: Create Register page

**Files:**
- Create: `src/pages/Register.tsx`

The page has two states: `"form"` (registration form) and `"aha"` (number reveal). When state is `"aha"`, it renders `<AhaMoment />` full-screen. The subscription row (plan = 'trial', 30-day window) is created after the profile is persisted.

- [ ] **Step 1: Create the file**

```typescript
// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { AuthModal } from "@/components/AuthModal";
import { AhaMoment } from "@/components/AhaMoment";

type PageState = "form" | "aha";

interface AhaData {
  lifePathNumber: number;
  archetype: string;
  archetypeDescription: string;
}

export default function Register() {
  const { createProfile } = useProfile();

  const [pageState, setPageState] = useState<PageState>("form");
  const [ahaData, setAhaData] = useState<AhaData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) { setError("Ingresa tu nombre."); return; }
    if (!birthDate) { setError("Selecciona tu fecha de nacimiento."); return; }
    if (!email.trim()) { setError("Ingresa tu email."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (signUpError) {
        if (
          signUpError.message?.includes("already registered") ||
          signUpError.status === 422
        ) {
          setError(
            "Este email ya tiene una cuenta. Inicia sesión en lugar de registrarte."
          );
        } else {
          setError(signUpError.message || "Error al crear la cuenta.");
        }
        return;
      }

      const userId = data?.user?.id;
      if (!userId || !data.session) {
        setError("No se pudo crear la cuenta. Verifica que el email sea válido.");
        return;
      }

      // Compute numerology and persist profile
      const profile = await createProfile(name.trim(), birthDate, userId);

      // Create 30-day trial subscription
      const now = new Date();
      const trialEndsAt = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: "trial",
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEndsAt,
      });

      // Transition to aha moment
      setAhaData({
        lifePathNumber: profile.lifePathNumber,
        archetype: profile.archetype,
        archetypeDescription: profile.description,
      });
      setPageState("aha");
    } catch (err: any) {
      setError(err.message || "Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (pageState === "aha" && ahaData) {
    return <AhaMoment {...ahaData} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0D0C14" }}
    >
      {/* Nav */}
      <nav
        className="flex justify-between items-center px-6 py-4"
        style={{ borderBottom: "1px solid #1e1c2e" }}
      >
        <span
          className="font-serif"
          style={{ color: "#e8e8e8", fontSize: "14px", letterSpacing: "0.05em" }}
        >
          ✦ Arithmos
        </span>
        <span className="font-sans" style={{ fontSize: "11px", color: "#888" }}>
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="underline underline-offset-2"
            style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer" }}
          >
            Iniciar Sesión
          </button>
        </span>
      </nav>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full" style={{ maxWidth: "320px" }}>
          <p
            className="uppercase font-sans text-center mb-3"
            style={{ fontSize: "9px", letterSpacing: "0.4em", color: "#B8860B" }}
          >
            30 días Premium gratis
          </p>

          <h1
            className="font-serif font-semibold text-center mb-6"
            style={{ fontSize: "22px", color: "#e8e8e8", lineHeight: "1.3" }}
          >
            Crea tu Blueprint
          </h1>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full font-sans outline-none"
              style={{
                background: "#141222",
                border: "1px solid #2a2840",
                borderRadius: "4px",
                padding: "10px 12px",
                color: "#e8e8e8",
                fontSize: "13px",
              }}
            />
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min="1920-01-01"
              className="w-full font-sans outline-none"
              style={{
                background: "#141222",
                border: "1px solid #2a2840",
                borderRadius: "4px",
                padding: "10px 12px",
                color: birthDate ? "#e8e8e8" : "#888",
                fontSize: "13px",
                colorScheme: "dark",
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full font-sans outline-none"
              style={{
                background: "#141222",
                border: "1px solid #2a2840",
                borderRadius: "4px",
                padding: "10px 12px",
                color: "#e8e8e8",
                fontSize: "13px",
              }}
            />
            <input
              type="password"
              placeholder="Contraseña (mínimo 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full font-sans outline-none"
              style={{
                background: "#141222",
                border: "1px solid #2a2840",
                borderRadius: "4px",
                padding: "10px 12px",
                color: "#e8e8e8",
                fontSize: "13px",
              }}
            />
          </div>

          {error && (
            <p
              className="font-sans mt-3"
              style={{
                fontSize: "12px",
                color: "#f87171",
                background: "rgba(239,68,68,0.1)",
                padding: "8px 12px",
                borderRadius: "4px",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full font-sans font-bold mt-4"
            style={{
              padding: "12px",
              background: loading ? "#a0852a" : "#D4AF37",
              color: "#0D0C14",
              borderRadius: "4px",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {loading ? "Calculando..." : "Calcular mi Blueprint →"}
          </button>

          <p
            className="font-sans text-center mt-3"
            style={{ fontSize: "10px", color: "#555" }}
          >
            ✓ Sin tarjeta de crédito · Sin compromiso
          </p>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds (Register.tsx imports exist, types resolve)

- [ ] **Step 3: Commit**

```bash
git add src/pages/Register.tsx
git commit -m "feat: add Register page with form and aha moment states"
```

---

## Task 3: Rebuild Index.tsx

**Files:**
- Modify: `src/pages/Index.tsx` (full replace)

The current `Index.tsx` imports four landing components that are about to be deleted. Replace its entire content with the single-screen landing.

- [ ] **Step 1: Replace Index.tsx**

```typescript
// src/pages/Index.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";

export default function Index() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0D0C14" }}
    >
      {/* Nav */}
      <nav
        className="flex justify-between items-center px-6 py-4"
        style={{ borderBottom: "1px solid #1e1c2e" }}
      >
        <span
          className="font-serif"
          style={{ color: "#e8e8e8", fontSize: "14px", letterSpacing: "0.05em" }}
        >
          ✦ Arithmos
        </span>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="font-sans underline underline-offset-2"
          style={{
            fontSize: "11px",
            color: "#888",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Iniciar Sesión
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p
          className="uppercase font-sans mb-5"
          style={{ fontSize: "9px", letterSpacing: "0.4em", color: "#B8860B" }}
        >
          30 días Premium · Sin tarjeta de crédito
        </p>

        <h1
          className="font-serif font-semibold mb-4"
          style={{
            fontSize: "28px",
            color: "#e8e8e8",
            lineHeight: "1.3",
            maxWidth: "360px",
          }}
        >
          ¿Operas a favor de tu ciclo natural, o en su contra?
        </h1>

        <p
          className="font-sans mb-8"
          style={{
            fontSize: "13px",
            color: "#777",
            maxWidth: "280px",
            lineHeight: "1.7",
          }}
        >
          Numerología determinista aplicada a decisiones de alto impacto. Tu
          Blueprint personal en 60 segundos.
        </p>

        <Link
          to="/register"
          className="font-sans font-bold"
          style={{
            padding: "13px 40px",
            background: "#D4AF37",
            color: "#0D0C14",
            borderRadius: "4px",
            fontSize: "14px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Descubrir mi Blueprint →
        </Link>

        <p
          className="font-sans mt-4"
          style={{ fontSize: "10px", color: "#555" }}
        >
          ✓ Sin tarjeta · 30 días completos · Sin compromiso
        </p>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds. Note: HeroSection/ValueProposition/PricingSection/Footer are still on disk (not imported anywhere now), so no missing-module errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat: rebuild landing page as single-screen dark hero"
```

---

## Task 4: Simplify AuthModal to login-only

**Files:**
- Modify: `src/components/AuthModal.tsx` (full replace)

Remove: register tab, `PlanType` export, `defaultTab` prop, `selectedPlan` prop, all register state (`fullName`, `phone`, `birthDate`), `handleRegister`, plan labels, and the anonymous-auth link. Keep: login form, framer-motion animations, shadcn `Input`/`Button`/`Label`. Add: "¿No tienes cuenta?" link to `/register`.

- [ ] **Step 1: Replace AuthModal.tsx**

```typescript
// src/components/AuthModal.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Completa tu email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onClose();
      navigate("/dashboard");
    } catch (err: any) {
      if (err.message?.includes("Invalid login")) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError(err.message || "Error iniciando sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass rounded-2xl p-8 w-full max-w-md shadow-2xl pointer-events-auto relative border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-sans uppercase tracking-widest text-primary">
                  Arithmos
                </span>
              </div>

              <h2 className="text-2xl font-serif font-semibold text-foreground mb-1">
                Bienvenido de vuelta
              </h2>
              <p className="text-sm text-muted-foreground font-sans mb-6">
                Accede a tu blueprint y continúa tu progreso.
              </p>

              <div className="space-y-4" onKeyDown={handleKey}>
                <div className="space-y-2">
                  <Label className="text-sm font-sans text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-sans text-muted-foreground">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 font-sans bg-red-500/10 px-4 py-2 rounded-lg"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full glow-indigo group"
                >
                  {loading ? "Procesando..." : "Entrar"}
                  {!loading && (
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground font-sans pt-1">
                  ¿No tienes cuenta?{" "}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => {
                      onClose();
                      navigate("/register");
                    }}
                  >
                    Crear una gratis →
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npm run test
```

Expected: PASS — existing AhaMoment tests still pass, no new failures

- [ ] **Step 3: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/AuthModal.tsx
git commit -m "refactor: simplify AuthModal to login-only, add link to /register"
```

---

## Task 5: Update App.tsx routes

**Files:**
- Modify: `src/App.tsx`

Add the `/register` route, replace the `/onboarding` route with a redirect to `/dashboard`, and remove the `Onboarding` import.

- [ ] **Step 1: Replace the relevant lines in App.tsx**

The full file after edits:

```typescript
// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// Arithmos AI Strategist - Production Build v1.2.7
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import Journal from "./pages/Journal";
import Ranking from "./pages/Ranking";
import Settings from "./pages/Settings";
import Synchronicity from "./pages/Synchronicity";
import AdminDashboard from "./pages/AdminDashboard";
import RadarEquipo from "./pages/RadarEquipo";
import DeepDive from "./pages/DeepDive";
import TribunalPoder from "./pages/TribunalPoder";
import Evolucion from "./pages/Evolucion";
import CoachChat from "./pages/CoachChat";
import FrictionRadar from "./pages/FrictionRadar";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/synchronicity" element={<Synchronicity />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/radar-equipo" element={<RadarEquipo />} />
          <Route path="/deep-dive" element={<DeepDive />} />
          <Route path="/tribunal-poder" element={<TribunalPoder />} />
          <Route path="/evolucion" element={<Evolucion />} />
          <Route path="/coach" element={<CoachChat />} />
          <Route path="/radar-friccion" element={<FrictionRadar />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/privasidad" element={<PrivacyPolicy />} />
          <Route path="/delete-account" element={<DataDeletion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds. `Onboarding.tsx` is still on disk so there's no missing file, but it's no longer imported — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add /register route and redirect /onboarding to /dashboard"
```

---

## Task 6: Delete obsolete files

**Files to delete:**
- `src/pages/Onboarding.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/ValueProposition.tsx`
- `src/components/landing/PricingSection.tsx`
- `src/components/landing/Footer.tsx`

None of these files are imported anywhere after Tasks 3–5. Safe to delete.

- [ ] **Step 1: Delete the files**

```bash
rm src/pages/Onboarding.tsx
rm src/components/landing/HeroSection.tsx
rm src/components/landing/ValueProposition.tsx
rm src/components/landing/PricingSection.tsx
rm src/components/landing/Footer.tsx
```

- [ ] **Step 2: Run all tests**

```bash
npm run test
```

Expected: PASS — AhaMoment tests passing, no regressions

- [ ] **Step 3: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds with no missing-module errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete obsolete landing components and Onboarding page"
```
