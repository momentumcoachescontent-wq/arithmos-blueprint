import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Registro de Service Worker para Notificaciones Push (Fase 4)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registrado con éxito:', registration.scope);
        }).catch((error) => {
            console.log('Fallo en registro de SW:', error);
        });
    });
}
