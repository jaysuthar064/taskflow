export const isPushSupported = () => {
    return (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
};

const TASKFLOW_CACHE_PREFIXES = ["taskflow-static-", "taskflow-runtime-"];

const canRegisterServiceWorker = () => {
    if (typeof window === "undefined") {
        return false;
    }

    if (import.meta.env.PROD) {
        return true;
    }

    return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let index = 0; index < rawData.length; index += 1) {
        outputArray[index] = rawData.charCodeAt(index);
    }

    return outputArray;
};

export const registerPushServiceWorker = async () => {
    if (!isPushSupported() || !canRegisterServiceWorker()) {
        return null;
    }

    const registration = await navigator.serviceWorker.register("/push-sw.js", {
        scope: "/",
        updateViaCache: "none"
    });
    await registration.update();
    return navigator.serviceWorker.ready;
};

export const clearTaskflowServiceWorkerState = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
        registrations
            .filter((registration) =>
                [registration.active, registration.waiting, registration.installing]
                    .map((worker) => worker?.scriptURL || "")
                    .some((scriptURL) => scriptURL.includes("/push-sw.js"))
            )
            .map((registration) => registration.unregister())
    );

    if (!("caches" in window)) {
        return;
    }

    const cacheKeys = await caches.keys();
    await Promise.all(
        cacheKeys
            .filter((cacheKey) => TASKFLOW_CACHE_PREFIXES.some((prefix) => cacheKey.startsWith(prefix)))
            .map((cacheKey) => caches.delete(cacheKey))
    );
};

export const getExistingPushSubscription = async () => {
    const registration = await registerPushServiceWorker();
    return registration?.pushManager.getSubscription() ?? null;
};

export const subscribeToPush = async (publicKey) => {
    const registration = await registerPushServiceWorker();

    if (!registration) {
        throw new Error("Push notifications are not supported in this browser.");
    }

    return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
};
