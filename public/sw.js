/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'arithmos-cache-v1';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activado');
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Arithmos', body: 'Nueva notificación de poder.' };

    const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
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
        clients.openWindow(event.notification.data.url)
    );
});
