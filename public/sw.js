/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Este placeholder es reemplazado automáticamente por Workbox durante `npm run build`
// con el manifest de todos los assets que se pre-cachearán.
precacheAndRoute(self.__WB_MANIFEST);

// Limpia cachés de versiones de SW anteriores
cleanupOutdatedCaches();

// Tomar el control de todas las pestañas al activarse
self.addEventListener('activate', (event) => {
    console.log('[Arithmos SW] Activado y listo.');
    event.waitUntil(self.clients.claim());
});

// ─────────────────────────────────────────────────
// Push Notifications
// ─────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    const data = event.data
        ? event.data.json()
        : { title: 'Arithmos', body: 'Nueva revelación numerológica.' };

    const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
