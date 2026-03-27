import PushSubscription from "../models/PushSubscription.js";
import {
    getPushPublicKey,
    isPushConfigured,
    isValidPushSubscription
} from "../services/pushNotificationService.js";

export const getPushPublicKeyController = async (req, res) => {
    try {
        if (!isPushConfigured()) {
            return res.status(503).json({
                message: "Push notifications are not configured on the server."
            });
        }

        return res.status(200).json({
            publicKey: getPushPublicKey()
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to load push notification settings."
        });
    }
};

export const savePushSubscription = async (req, res) => {
    try {
        const { subscription } = req.body;

        if (!isValidPushSubscription(subscription)) {
            return res.status(400).json({
                message: "A valid push subscription is required."
            });
        }

        const savedSubscription = await PushSubscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                $set: {
                    user: req.user._id,
                    endpoint: subscription.endpoint,
                    expirationTime: subscription.expirationTime ?? null,
                    keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    },
                    userAgent: req.get("user-agent") || ""
                }
            },
            {
                upsert: true,
                returnDocument: "after",
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            message: "Push subscription saved successfully.",
            data: {
                id: savedSubscription._id,
                endpoint: savedSubscription.endpoint
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to save push subscription."
        });
    }
};

export const deletePushSubscription = async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({
                message: "A subscription endpoint is required."
            });
        }

        await PushSubscription.deleteOne({
            user: req.user._id,
            endpoint
        });

        return res.status(200).json({
            message: "Push subscription removed successfully."
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to remove push subscription."
        });
    }
};
