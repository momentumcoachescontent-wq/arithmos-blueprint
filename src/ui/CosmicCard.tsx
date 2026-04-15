import { type ReactNode, forwardRef } from "react";
import { motion, type MotionProps } from "framer-motion";

/* ============================================
   COSMIC CARD — Glass-morphic content container
   ============================================ */

type GlowColor = "violet" | "gold" | "teal" | "magenta" | "indigo" | "none";

interface CosmicCardProps extends MotionProps {
  children: ReactNode;
  /** Accent glow color on hover / active */
  glow?: GlowColor;
  /** Whether the card is in an "active" highlighted state */
  active?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Padding variant */
  padding?: "sm" | "md" | "lg" | "none";
  /** Click handler */
  onClick?: () => void;
}

const GLOW_MAP: Record<GlowColor, { border: string; shadow: string }> = {
  violet: {
    border: "hsl(270 80% 65% / 0.4)",
    shadow: "0 0 30px -8px hsl(270 80% 65% / 0.25)",
  },
  gold: {
    border: "hsl(45 90% 60% / 0.4)",
    shadow: "0 0 30px -8px hsl(45 90% 60% / 0.25)",
  },
  teal: {
    border: "hsl(175 70% 50% / 0.4)",
    shadow: "0 0 30px -8px hsl(175 70% 50% / 0.25)",
  },
  magenta: {
    border: "hsl(310 80% 60% / 0.4)",
    shadow: "0 0 30px -8px hsl(310 80% 60% / 0.25)",
  },
  indigo: {
    border: "hsl(230 80% 65% / 0.4)",
    shadow: "0 0 30px -8px hsl(230 80% 65% / 0.25)",
  },
  none: {
    border: "hsl(260 20% 100% / 0.1)",
    shadow: "none",
  },
};

const PADDING_MAP = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const CosmicCard = forwardRef<HTMLDivElement, CosmicCardProps>(
  (
    {
      children,
      glow = "none",
      active = false,
      className = "",
      padding = "md",
      onClick,
      ...motionProps
    },
    ref
  ) => {
    const glowConfig = GLOW_MAP[glow];
    const isInteractive = !!onClick;

    return (
      <motion.div
        ref={ref}
        className={`
          relative overflow-hidden rounded-[var(--cosm-radius-lg)]
          backdrop-blur-xl
          ${PADDING_MAP[padding]}
          ${isInteractive ? "cursor-pointer" : ""}
          ${className}
        `}
        style={{
          background: active
            ? "hsl(260 15% 10%)"
            : "hsl(260 15% 8%)",
          border: `1px solid ${
            active ? glowConfig.border : "hsl(260 15% 16%)"
          }`,
          boxShadow: active ? glowConfig.shadow : "none",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        whileHover={
          isInteractive
            ? {
                y: -2,
                borderColor: glowConfig.border,
                boxShadow: glowConfig.shadow,
              }
            : undefined
        }
        whileTap={isInteractive ? { scale: 0.98 } : undefined}
        onClick={onClick}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

CosmicCard.displayName = "CosmicCard";

/* ============================================
   COSMIC BADGE — Small status/label indicator
   ============================================ */

interface CosmicBadgeProps {
  children: ReactNode;
  variant?: "violet" | "gold" | "teal" | "magenta" | "indigo" | "ghost";
  size?: "sm" | "md";
  className?: string;
}

const BADGE_VARIANTS = {
  violet: {
    bg: "hsl(270 80% 65% / 0.15)",
    text: "hsl(270 80% 75%)",
    border: "hsl(270 80% 65% / 0.2)",
  },
  gold: {
    bg: "hsl(45 90% 60% / 0.12)",
    text: "hsl(45 90% 70%)",
    border: "hsl(45 90% 60% / 0.2)",
  },
  teal: {
    bg: "hsl(175 70% 50% / 0.12)",
    text: "hsl(175 70% 65%)",
    border: "hsl(175 70% 50% / 0.2)",
  },
  magenta: {
    bg: "hsl(310 80% 60% / 0.12)",
    text: "hsl(310 80% 70%)",
    border: "hsl(310 80% 60% / 0.2)",
  },
  indigo: {
    bg: "hsl(230 80% 65% / 0.12)",
    text: "hsl(230 80% 75%)",
    border: "hsl(230 80% 65% / 0.2)",
  },
  ghost: {
    bg: "hsl(260 20% 100% / 0.05)",
    text: "hsl(260 10% 65%)",
    border: "hsl(260 20% 100% / 0.08)",
  },
};

export function CosmicBadge({
  children,
  variant = "violet",
  size = "sm",
  className = "",
}: CosmicBadgeProps) {
  const v = BADGE_VARIANTS[variant];
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"}
        ${className}
      `}
      style={{
        fontFamily: "var(--cosm-font-body)",
        background: v.bg,
        color: v.text,
        border: `1px solid ${v.border}`,
      }}
    >
      {children}
    </span>
  );
}

/* ============================================
   COSMIC SECTION HEADER — Page section titles
   ============================================ */

interface CosmicSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CosmicSectionHeader({
  title,
  subtitle,
  action,
  className = "",
}: CosmicSectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between ${className}`}>
      <div>
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{
            fontFamily: "var(--cosm-font-display)",
            color: "hsl(0 0% 95%)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-0.5 text-sm"
            style={{
              fontFamily: "var(--cosm-font-body)",
              color: "hsl(260 10% 55%)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ============================================
   COSMIC ICON CIRCLE — Icon with glow background
   ============================================ */

interface CosmicIconCircleProps {
  icon: ReactNode;
  color?: GlowColor;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ICON_SIZE_MAP = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-xl",
};

const ICON_COLOR_MAP: Record<GlowColor, { bg: string; text: string }> = {
  violet: {
    bg: "hsl(270 80% 65% / 0.15)",
    text: "hsl(270 80% 75%)",
  },
  gold: {
    bg: "hsl(45 90% 60% / 0.15)",
    text: "hsl(45 90% 70%)",
  },
  teal: {
    bg: "hsl(175 70% 50% / 0.15)",
    text: "hsl(175 70% 65%)",
  },
  magenta: {
    bg: "hsl(310 80% 60% / 0.15)",
    text: "hsl(310 80% 70%)",
  },
  indigo: {
    bg: "hsl(230 80% 65% / 0.15)",
    text: "hsl(230 80% 75%)",
  },
  none: {
    bg: "hsl(260 20% 100% / 0.06)",
    text: "hsl(260 10% 65%)",
  },
};

export function CosmicIconCircle({
  icon,
  color = "violet",
  size = "md",
  className = "",
}: CosmicIconCircleProps) {
  const ic = ICON_COLOR_MAP[color];
  return (
    <div
      className={`
        flex items-center justify-center rounded-full
        ${ICON_SIZE_MAP[size]}
        ${className}
      `}
      style={{
        background: ic.bg,
        color: ic.text,
      }}
    >
      {icon}
    </div>
  );
}
