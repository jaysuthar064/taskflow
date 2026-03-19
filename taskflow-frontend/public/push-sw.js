self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

const getNotificationPayload = (event) => {
    if (!event.data) {
        return {
            title: "TaskFlow Reminder",
            body: "You have a reminder waiting."
        };
    }

    try {
        return event.data.json();
    } catch {
        return {
            title: "TaskFlow Reminder",
            body: event.data.text() || "You have a reminder waiting."
        };
    }
};

self.addEventListener("push", (event) => {
    const payload = getNotificationPayload(event);
    const title = payload.title || "TaskFlow Reminder";
    const url = payload.url || "/dashboard";

    event.waitUntil(
        self.registration.showNotification(title, {
            body: payload.body || "You have a reminder waiting.",
            icon: payload.icon || "/notification-icon-192.png",
            badge: payload.badge || "/notification-badge-96.png",
            tag: payload.tag || "taskflow-reminder",
            renotify: Boolean(payload.renotify),
            data: {
                url,
                ...(payload.data || {})
            }
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const destination = event.notification.data?.url || "/dashboard";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if ("focus" in client) {
                    const navigation = "navigate" in client
                        ? client.navigate(destination)
                        : Promise.resolve(client);

                    return navigation.then((windowClient) => {
                        return windowClient?.focus ? windowClient.focus() : client.focus();
                    });
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(destination);
            }

            return undefined;
        })
    );
});
