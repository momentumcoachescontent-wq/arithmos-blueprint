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
