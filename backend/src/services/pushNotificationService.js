import webpush from "web-push";
import PushSubscription from "../models/PushSubscription.js";

let hasConfiguredVapid = false;
let hasLoggedMissingConfig = false;

const getVapidConfig = () => ({
    subject: process.env.VAPID_SUBJECT || "",
    publicKey: process.env.VAPID_PUBLIC_KEY || "",
    privateKey: process.env.VAPID_PRIVATE_KEY || ""
});

const ensureWebPushConfigured = () => {
    if (hasConfiguredVapid) {
        return true;
    }

    const { subject, publicKey, privateKey } = getVapidConfig();

    if (!subject || !publicKey || !privateKey) {
        if (!hasLoggedMissingConfig) {
            console.warn("[PushNotifications] Missing VAPID_SUBJECT, VAPID_PUBLIC_KEY, or VAPID_PRIVATE_KEY. Web push is disabled.");
            hasLoggedMissingConfig = true;
        }

        return false;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    hasConfiguredVapid = true;
    return true;
};

export const getPushPublicKey = () => getVapidConfig().publicKey;

export const isPushConfigured = () => {
    const { subject, publicKey, privateKey } = getVapidConfig();
    return Boolean(subject && publicKey && privateKey);
};

export const isValidPushSubscription = (subscription) => {
    return Boolean(
        subscription &&
        typeof subscription.endpoint === "string" &&
        subscription.endpoint &&
        subscription.keys &&
        typeof subscription.keys.p256dh === "string" &&
        subscription.keys.p256dh &&
        typeof subscription.keys.auth === "string" &&
        subscription.keys.auth
    );
};

export const sendPushToUser = async ({
    userId,
    title,
    body,
    url = "/dashboard",
    tag = "taskflow-notification",
    data = {}
}) => {
    if (!ensureWebPushConfigured()) {
        return {
            sent: 0,
            failed: 0,
            skipped: true
        };
    }

    const subscriptions = await PushSubscription.find({ user: userId }).lean();

    if (!subscriptions.length) {
        return {
            sent: 0,
            failed: 0,
            skipped: false
        };
    }

    const payload = JSON.stringify({
        title,
        body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag,
        url,
        data
    });

    let sent = 0;
    let failed = 0;

    await Promise.all(
        subscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        expirationTime: subscription.expirationTime,
                        keys: subscription.keys
                    },
                    payload
                );
                sent += 1;
            } catch (error) {
                failed += 1;

                if (error.statusCode === 404 || error.statusCode === 410) {
                    await PushSubscription.deleteOne({ endpoint: subscription.endpoint });
                    return;
                }

                console.error("[PushNotifications] Failed to send notification", error);
            }
        })
    );

    return {
        sent,
        failed,
        skipped: false
    };
};
