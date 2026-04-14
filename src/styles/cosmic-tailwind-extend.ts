/**
 * Cosmic Design System — Tailwind Extension
 * 
 * These values extend the existing Tailwind config
 * to integrate the V3 Celestial Cyberpunk tokens.
 * Import and spread into tailwind.config.ts
 */

export const cosmicColors = {
  cosmic: {
    void: "hsl(260 20% 4%)",
    surface: "hsl(260 15% 8%)",
    "surface-raised": "hsl(260 12% 12%)",
    "surface-glow": "hsl(260 10% 16%)",
    violet: "hsl(270 80% 65%)",
    purple: "hsl(280 70% 55%)",
    magenta: "hsl(310 80% 60%)",
    gold: "hsl(45 90% 60%)",
    teal: "hsl(175 70% 50%)",
    cyan: "hsl(190 90% 60%)",
  },
  "cosm-text": {
    primary: "hsl(0 0% 95%)",
    secondary: "hsl(260 10% 65%)",
    muted: "hsl(260 8% 45%)",
    ghost: "hsl(260 5% 30%)",
  },
};

export const cosmicFontFamily = {
  display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
  body: ["Outfit", "Inter", "system-ui", "sans-serif"],
  accent: ["Playfair Display", "Georgia", "serif"],
};

export const cosmicKeyframes = {
  float: {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-8px)" },
  },
  shimmer: {
    "0%, 100%": { backgroundPosition: "-200% center" },
    "50%": { backgroundPosition: "200% center" },
  },
  "glow-pulse": {
    "0%, 100%": { opacity: "0.3" },
    "50%": { opacity: "0.8" },
  },
  "spin-slow": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  "cosmic-fade-in": {
    from: { opacity: "0", transform: "translateY(20px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },
};

export const cosmicAnimation = {
  float: "float 4s ease-in-out infinite",
  shimmer: "shimmer 3s ease-in-out infinite",
  "glow-pulse": "glow-pulse 3s ease-in-out infinite",
  "spin-slow": "spin-slow 20s linear infinite",
  "cosmic-fade-in": "cosmic-fade-in 0.6s ease-out forwards",
};
