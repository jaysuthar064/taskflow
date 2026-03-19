self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("taskflow-static-v1").then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/offline.html",
                "/app.webmanifest",
                "/favicon.svg",
                "/apple-touch-icon.png",
                "/icon-192.png",
                "/icon-512.png",
                "/icon-maskable-512.png",
                "/notification-icon-192.png",
                "/notification-badge-96.png"
            ]);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheKeys = await caches.keys();
            await Promise.all(
                cacheKeys.map((cacheKey) => {
                    if (!["taskflow-static-v1", "taskflow-runtime-v1"].includes(cacheKey)) {
                        return caches.delete(cacheKey);
                    }

                    return Promise.resolve();
                })
            );

            if (self.registration.navigationPreload) {
                await self.registration.navigationPreload.enable();
            }

            await self.clients.claim();
        })()
    );
});

const cacheRuntimeAsset = async (request, response) => {
    const cache = await caches.open("taskflow-runtime-v1");
    await cache.put(request, response.clone());
    return response;
};

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const requestURL = new URL(request.url);

    if (requestURL.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    const preloadResponse = await event.preloadResponse;

                    if (preloadResponse) {
                        return cacheRuntimeAsset(request, preloadResponse);
                    }

                    const networkResponse = await fetch(request);
                    return cacheRuntimeAsset(request, networkResponse);
                } catch {
                    return (
                        await caches.match(request) ||
                        await caches.match("/") ||
                        await caches.match("/offline.html")
                    );
                }
            })()
        );

        return;
    }

    if (!["script", "style", "image", "font", "manifest"].includes(request.destination)) {
        return;
    }

    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(request);
            const fetchPromise = fetch(request)
                .then((networkResponse) => cacheRuntimeAsset(request, networkResponse))
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })()
    );
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
