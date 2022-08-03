self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }
    if (event.data) {
        const message = event.data.json();
        var promise = self.registration.showNotification(message.title, message.data);
        event.waitUntil(promise);
    }
});

self.addEventListener('notificationclick', function(event) {
    if (event.notification.data && event.notification.data.url) {
        const promise = clients.openWindow(event.notification.data.url);
        event.waitUntil(promise);
        setTimeout(() => {
            event.notification.close();
        }, 500);
    }
});
