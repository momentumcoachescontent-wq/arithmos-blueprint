import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicParticles } from "./CosmicParticles";

interface CosmicShellProps {
  children: ReactNode;
  /** Show floating particles background */
  particles?: boolean;
  /** Particle palette */
  particlePalette?: "violet" | "gold" | "teal" | "mixed";
  /** Whether to show the gradient overlay at top */
  gradientTop?: boolean;
}

/**
 * Root visual shell for all pages.
 * Provides the cosmic background, particles, and gradient overlays.
 */
export function CosmicShell({
  children,
  particles = true,
  particlePalette = "mixed",
  gradientTop = true,
}: CosmicShellProps) {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "hsl(260 20% 4%)" }}
    >
      {/* Subtle radial gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, hsla(280, 50%, 15%, 0.4) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 100%, hsla(270, 60%, 12%, 0.3) 0%, transparent 60%),
            radial-gradient(ellipse 30% 25% at 10% 60%, hsla(45, 50%, 10%, 0.15) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Particle system */}
      {particles && (
        <CosmicParticles
          count={35}
          palette={particlePalette}
          speed={0.2}
          maxSize={2}
          connect
        />
      )}

      {/* Top gradient fade for status bar area */}
      {gradientTop && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "linear-gradient(to bottom, hsl(260 20% 4%) 0%, transparent 100%)",
            zIndex: 40,
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ============================================
   COSMIC BOTTOM NAV — Gen Z mobile-first nav
   ============================================ */

export interface CosmicNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  /** Whether this is the primary action (center button) */
  primary?: boolean;
}

interface CosmicBottomNavProps {
  items: CosmicNavItem[];
  active: string;
  onChange: (id: string) => void;
}

export function CosmicBottomNav({ items, active, onChange }: CosmicBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 cosmic-glass safe-bottom"
      style={{
        zIndex: 50,
        borderTop: "1px solid hsl(260 20% 100% / 0.06)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pb-1 pt-2">
        {items.map((item) => {
          const isActive = active === item.id;

          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className="group relative -mt-5 flex flex-col items-center"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, hsl(270 80% 65%), hsl(310 80% 60%))"
                      : "hsl(260 15% 12%)",
                    border: `2px solid ${isActive ? "hsl(270 80% 65% / 0.5)" : "hsl(260 20% 100% / 0.1)"}`,
                    boxShadow: isActive
                      ? "0 0 24px -4px hsl(270 80% 65% / 0.4)"
                      : "none",
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <span className="text-xl">{item.icon}</span>
                </motion.div>
                <span
                  className="mt-1 text-[10px] font-medium tracking-wide"
                  style={{
                    fontFamily: "var(--cosm-font-body)",
                    color: isActive
                      ? "hsl(270 80% 75%)"
                      : "hsl(260 10% 45%)",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="group flex flex-col items-center py-1"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: isActive ? "hsl(260 20% 100% / 0.08)" : "transparent",
                }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span
                  className="text-lg transition-colors"
                  style={{
                    color: isActive
                      ? "hsl(270 80% 75%)"
                      : "hsl(260 8% 45%)",
                  }}
                >
                  {item.icon}
                </span>
              </motion.div>

              <span
                className="mt-0.5 text-[10px] font-medium tracking-wide transition-colors"
                style={{
                  fontFamily: "var(--cosm-font-body)",
                  color: isActive
                    ? "hsl(270 80% 75%)"
                    : "hsl(260 8% 45%)",
                }}
              >
                {item.label}
              </span>

              {/* Active dot indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="mt-0.5 h-1 w-1 rounded-full"
                    style={{ background: "hsl(270 80% 65%)" }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
