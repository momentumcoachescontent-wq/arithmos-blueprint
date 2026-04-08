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
