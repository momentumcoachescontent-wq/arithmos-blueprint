import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { AuthModal } from "@/components/AuthModal";
import { AhaMoment } from "@/components/AhaMoment";

interface AhaData {
  lifePathNumber: number;
  archetype: string;
  archetypeDescription: string;
}

const inputStyle: React.CSSProperties = {
  background: "#141222",
  border: "1px solid #2a2840",
  borderRadius: "4px",
  padding: "10px 12px",
  color: "#e8e8e8",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function Register() {
  const navigate = useNavigate();
  const { createProfile } = useProfile();

  const [pageState, setPageState] = useState<"form" | "aha">("form");
  const [ahaData, setAhaData] = useState<AhaData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre.");
      return;
    }
    if (!birthDate) {
      setError("Por favor ingresa tu fecha de nacimiento.");
      return;
    }
    const birthDateObj = new Date(birthDate);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    if (birthDateObj > todayDate || birthDateObj < new Date("1920-01-01")) {
      setError("Ingresa una fecha de nacimiento válida.");
      return;
    }
    if (!email.trim()) {
      setError("Por favor ingresa tu email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un email válido.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (signUpError) {
        if (
          signUpError.message.toLowerCase().includes("already registered") ||
          signUpError.status === 422
        ) {
          setError(
            "Este email ya tiene una cuenta. Inicia sesión o usa otro email."
          );
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      const newUser = authData?.user;
      const userId = newUser?.id;
      const data = authData;

      // Email confirmation required (Supabase default)
      if (newUser && (!data.session || newUser.identities?.length === 0)) {
        setSuccess("✅ ¡Revisa tu email! Te enviamos un enlace de confirmación. Inicia sesión después de confirmar.");
        setLoading(false);
        return;
      }

      if (!userId || !data.session) {
        setError(
          "No se pudo crear la cuenta. Verifica que el email sea válido."
        );
        setLoading(false);
        return;
      }

      // 2. Create profile
      const profile = await createProfile(name.trim(), birthDate, userId);

      // 3. Insert subscription (30-day trial)
      const now = new Date();
      const trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: "trial",
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
      });
      if (subError) {
        console.error("Subscription insert failed:", subError.message);
      }

      // 4. Transition to aha moment
      setAhaData({
        lifePathNumber: profile.lifePathNumber,
        archetype: profile.archetype,
        archetypeDescription: profile.description,
      });
      setPageState("aha");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Aha moment state
  if (pageState === "aha" && ahaData) {
    return (
      <AhaMoment
        {...ahaData}
        onContinue={() => navigate("/dashboard")}
      />
    );
  }

  // Form state
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0C14",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #1e1c2e",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: "#e8e8e8",
          }}
        >
          ✦ Arithmos
        </span>
        <span style={{ fontSize: "13px", color: "#888" }}>
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#D4AF37",
              cursor: "pointer",
              fontSize: "13px",
              padding: 0,
            }}
          >
            Iniciar Sesión
          </button>
        </span>
      </nav>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "#B8860B",
              marginBottom: "10px",
              fontFamily: "sans-serif",
            }}
          >
            30 días Premium gratis
          </p>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "22px",
              color: "#e8e8e8",
              margin: 0,
              fontWeight: "normal",
            }}
          >
            Crea tu Blueprint
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            autoComplete="name"
          />

          <input
            type="date"
            aria-label="Fecha de nacimiento"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={today}
            min="1920-01-01"
            style={{ ...inputStyle, colorScheme: "dark" }}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="new-password"
          />

          {error && (
            <p
              style={{
                fontSize: "12px",
                color: "#e05c5c",
                margin: 0,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              className="font-sans mt-3"
              style={{
                fontSize: "12px",
                color: "#4ade80",
                background: "rgba(74,222,128,0.1)",
                padding: "8px 12px",
                borderRadius: "4px",
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#a0852a" : "#D4AF37",
              color: "#0D0C14",
              fontWeight: "bold",
              fontSize: "13px",
              padding: "12px",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              marginTop: "4px",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Calculando..." : "Calcular mi Blueprint →"}
          </button>

          <p
            style={{
              fontSize: "10px",
              color: "#555",
              textAlign: "center",
              margin: 0,
            }}
          >
            ✓ Sin tarjeta de crédito · Sin compromiso
          </p>
        </form>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
