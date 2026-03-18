import { useCallback, useEffect, useState } from "react";
import API from "../api/axios";
import {
    getExistingPushSubscription,
    isPushSupported,
    subscribeToPush
} from "../utils/pushNotifications";

const getInitialState = () => ({
    supported: isPushSupported(),
    configured: false,
    subscribed: false,
    permission: typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "default",
    publicKey: "",
    loading: false,
    ready: false,
    error: ""
});

export const usePushNotifications = () => {
    const [state, setState] = useState(getInitialState);

    const loadPublicKey = useCallback(async () => {
        try {
            const response = await API.get("/push/public-key");
            const publicKey = response.data?.publicKey || "";

            return {
                configured: Boolean(publicKey),
                publicKey,
                error: publicKey ? "" : "Push notifications are not configured on the server."
            };
        } catch (error) {
            return {
                configured: false,
                publicKey: "",
                error: error.response?.data?.message || "Push notifications are unavailable right now."
            };
        }
    }, []);

    const syncPushState = useCallback(async () => {
        if (!isPushSupported()) {
            setState({
                supported: false,
                configured: false,
                subscribed: false,
                permission: "default",
                publicKey: "",
                loading: false,
                ready: true,
                error: "This browser does not support push notifications."
            });
            return;
        }

        setState((prevState) => ({
            ...prevState,
            loading: true
        }));

        try {
            const [config, subscription] = await Promise.all([
                loadPublicKey(),
                getExistingPushSubscription()
            ]);

            if (subscription) {
                try {
                    await API.post("/push/subscriptions", {
                        subscription: subscription.toJSON()
                    });
                } catch (error) {
                    console.error("Unable to sync existing push subscription", error);
                }
            }

            setState({
                supported: true,
                configured: config.configured,
                subscribed: Boolean(subscription),
                permission: Notification.permission,
                publicKey: config.publicKey,
                loading: false,
                ready: true,
                error: config.error
            });
        } catch (error) {
            console.error("Unable to initialize push notifications", error);
            setState((prevState) => ({
                ...prevState,
                loading: false,
                ready: true,
                permission: Notification.permission,
                error: "Unable to initialize push notifications."
            }));
        }
    }, [loadPublicKey]);

    useEffect(() => {
        syncPushState();
    }, [syncPushState]);

    const enablePushNotifications = useCallback(async () => {
        if (!isPushSupported()) {
            setState((prevState) => ({
                ...prevState,
                supported: false,
                error: "This browser does not support push notifications."
            }));
            return false;
        }

        setState((prevState) => ({
            ...prevState,
            loading: true,
            error: ""
        }));

        try {
            let { publicKey, configured, error } = state;

            if (!configured || !publicKey) {
                const config = await loadPublicKey();
                publicKey = config.publicKey;
                configured = config.configured;
                error = config.error;
            }

            if (!configured || !publicKey) {
                setState((prevState) => ({
                    ...prevState,
                    configured,
                    publicKey,
                    permission: Notification.permission,
                    loading: false,
                    ready: true,
                    error
                }));
                return false;
            }

            let permission = Notification.permission;

            if (permission !== "granted") {
                permission = await Notification.requestPermission();
            }

            if (permission !== "granted") {
                setState((prevState) => ({
                    ...prevState,
                    configured: true,
                    permission,
                    loading: false,
                    ready: true,
                    error: permission === "denied"
                        ? "Notifications are blocked in your browser settings."
                        : "Notification permission is required to enable reminders."
                }));
                return false;
            }

            const subscription = await subscribeToPush(publicKey);

            await API.post("/push/subscriptions", {
                subscription: subscription.toJSON()
            });

            setState({
                supported: true,
                configured: true,
                subscribed: true,
                permission,
                publicKey,
                loading: false,
                ready: true,
                error: ""
            });

            return true;
        } catch (error) {
            console.error("Unable to enable push notifications", error);
            setState((prevState) => ({
                ...prevState,
                permission: Notification.permission,
                loading: false,
                ready: true,
                error: error.response?.data?.message || "Unable to enable push notifications."
            }));
            return false;
        }
    }, [loadPublicKey, state]);

    const disablePushNotifications = useCallback(async () => {
        if (!isPushSupported()) {
            return false;
        }

        setState((prevState) => ({
            ...prevState,
            loading: true,
            error: ""
        }));

        try {
            const subscription = await getExistingPushSubscription();

            if (subscription?.endpoint) {
                try {
                    await API.delete("/push/subscriptions", {
                        data: {
                            endpoint: subscription.endpoint
                        }
                    });
                } catch (error) {
                    console.error("Unable to remove push subscription from server", error);
                }

                await subscription.unsubscribe();
            }

            setState((prevState) => ({
                ...prevState,
                subscribed: false,
                permission: Notification.permission,
                loading: false,
                ready: true,
                error: ""
            }));

            return true;
        } catch (error) {
            console.error("Unable to disable push notifications", error);
            setState((prevState) => ({
                ...prevState,
                permission: Notification.permission,
                loading: false,
                ready: true,
                error: "Unable to disable push notifications."
            }));
            return false;
        }
    }, []);

    return {
        ...state,
        enablePushNotifications,
        disablePushNotifications,
        syncPushState
    };
};
