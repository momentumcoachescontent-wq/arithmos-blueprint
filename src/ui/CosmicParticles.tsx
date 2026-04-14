import { useEffect, useRef, useMemo } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

interface CosmicParticlesProps {
  /** Number of particles to render */
  count?: number;
  /** Color palette: 'violet' | 'gold' | 'teal' | 'mixed' */
  palette?: "violet" | "gold" | "teal" | "mixed";
  /** Speed multiplier (0.1 = very slow, 1 = default) */
  speed?: number;
  /** Max particle size in px */
  maxSize?: number;
  /** Whether to render connecting lines between nearby particles */
  connect?: boolean;
  /** CSS class for the container */
  className?: string;
}

const PALETTE_HUES: Record<string, number[]> = {
  violet: [270, 280, 290],
  gold: [35, 45, 55],
  teal: [170, 175, 185],
  mixed: [270, 280, 45, 175, 310],
};

/**
 * Hardware-accelerated particle system using canvas.
 * Renders floating, slightly-connected particles that drift
 * through the background creating a "cosmic dust" effect.
 */
export function CosmicParticles({
  count = 40,
  palette = "mixed",
  speed = 0.3,
  maxSize = 2.5,
  connect = true,
  className = "",
}: CosmicParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const hues = useMemo(() => PALETTE_HUES[palette] || PALETTE_HUES.mixed, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * maxSize + 0.5,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.1,
        hue: hues[Math.floor(Math.random() * hues.length)],
      }));
    };

    const draw = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update positions
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // Draw connecting lines
      if (connect) {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const lineOpacity = (1 - dist / maxDist) * 0.15;
              ctx.strokeStyle = `hsla(${particles[i].hue}, 60%, 60%, ${lineOpacity})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
        ctx.fill();

        // Subtle glow around larger particles
        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity * 0.1})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, palette, speed, maxSize, connect, hues]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
}
