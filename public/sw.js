self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (event.data) {
        const payload = event.data.json();
        event.waitUntil(
            self.registration.showNotification(payload.title || 'CigarLounge', {
                body: payload.body || 'You have a new notification!',
                icon: '/favicon.png',
                badge: '/favicon.png',
                image: payload.image || undefined,
                data: payload.url || '/'
            })
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.notification.data) {
        event.waitUntil(
            self.clients.openWindow(event.notification.data)
        );
    }
});
