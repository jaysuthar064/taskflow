export const isPushSupported = () => {
    return (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
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
    if (!isPushSupported()) {
        return null;
    }

    await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
    return navigator.serviceWorker.ready;
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
