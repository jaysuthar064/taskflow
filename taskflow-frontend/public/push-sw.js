const CACHE_VERSION = "v2";
const STATIC_CACHE = `taskflow-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `taskflow-runtime-${CACHE_VERSION}`;
const CACHEABLE_SHELL_ASSETS = [
    "/offline.html",
    "/app.webmanifest",
    "/favicon.svg",
    "/apple-touch-icon.png",
    "/icon-192.png",
    "/icon-512.png",
    "/icon-maskable-512.png",
    "/notification-icon-192.png",
    "/notification-badge-96.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(CACHEABLE_SHELL_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheKeys = await caches.keys();
            await Promise.all(
                cacheKeys.map((cacheKey) => {
                    if (
                        (cacheKey.startsWith("taskflow-static-") ||
                            cacheKey.startsWith("taskflow-runtime-")) &&
                        ![STATIC_CACHE, RUNTIME_CACHE].includes(cacheKey)
                    ) {
                        return caches.delete(cacheKey);
                    }

                    return Promise.resolve();
                })
            );

            if (self.registration.navigationPreload) {
                await self.registration.navigationPreload.enable();
            }

            await self.clients.claim();

            const clients = await self.clients.matchAll({
                type: "window",
                includeUncontrolled: true
            });

            await Promise.all(
                clients.map((client) =>
                    "navigate" in client
                        ? client.navigate(client.url).catch(() => undefined)
                        : Promise.resolve()
                )
            );
        })()
    );
});

const cacheRuntimeAsset = async (request, response) => {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
    return response;
};

const fetchNetworkFirst = async (request, fallbackResponse = null) => {
    try {
        const networkResponse = await fetch(request);
        return cacheRuntimeAsset(request, networkResponse);
    } catch {
        return fallbackResponse || caches.match(request);
    }
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
                const preloadResponse = await event.preloadResponse;

                if (preloadResponse) {
                    return cacheRuntimeAsset(request, preloadResponse);
                }

                return (
                    await fetchNetworkFirst(request) ||
                    await caches.match(request) ||
                    await caches.match("/offline.html")
                );
            })()
        );

        return;
    }

    if (!["script", "style", "image", "font", "manifest"].includes(request.destination)) {
        return;
    }

    event.respondWith(
        (async () => {
            if (["script", "style", "manifest"].includes(request.destination)) {
                return fetchNetworkFirst(request);
            }

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
