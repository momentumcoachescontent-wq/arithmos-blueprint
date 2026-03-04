import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      // Usar el SW custom para conservar la lógica de Push Notifications
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "icon-192x192.png",
        "icon-512x512.png",
      ],
      manifest: {
        name: "Arithmos AI Strategist",
        short_name: "Arithmos",
        description: "Transforma la incertidumbre en estrategia precisa. Numerología determinista para líderes y emprendedores.",
        theme_color: "#0A0A1A",
        background_color: "#0A0A1A",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "es",
        categories: ["education", "lifestyle", "productivity"],
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Activos que se pre-cachean en la instalación de la PWA
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Estrategia de caché para la API de Supabase: Network First (datos frescos)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutos
              },
              networkTimeoutSeconds: 10,
            },
          },
          // Fuentes de Google: Cache First (muy estáticas)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
