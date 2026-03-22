import { useEffect } from "react";
import { registerPushServiceWorker } from "../utils/pushNotifications";

const REMINDER_TAG_PREFIX = "task-reminder-";

const isAndroidBrowser = () => {
    if (typeof navigator === "undefined") {
        return false;
    }

    const platform = navigator.userAgentData?.platform || "";
    return platform === "Android" || /Android/i.test(navigator.userAgent || "");
};

const supportsNotificationTriggers = () => {
    return (
        typeof globalThis !== "undefined" &&
        typeof Notification !== "undefined" &&
        typeof globalThis.TimestampTrigger !== "undefined" &&
        "showTrigger" in Notification.prototype
    );
};

const buildReminderTag = (taskId) => `${REMINDER_TAG_PREFIX}${taskId}`;

export const useMobileScheduledReminders = ({ tasks = [], enabled = false }) => {
    useEffect(() => {
        if (!enabled || Notification.permission !== "granted") {
            return;
        }

        if (!isAndroidBrowser() || !supportsNotificationTriggers()) {
            return;
        }

        let isCancelled = false;

        const syncScheduledNotifications = async () => {
            try {
                const registration = await registerPushServiceWorker();

                if (!registration || isCancelled) {
                    return;
                }

                const now = Date.now();
                const nextReminders = new Map();

                tasks.forEach((task) => {
                    if (!task?.reminder || task.completed) {
                        return;
                    }

                    const reminderTime = new Date(task.reminder).getTime();

                    if (Number.isNaN(reminderTime) || reminderTime <= now) {
                        return;
                    }

                    nextReminders.set(buildReminderTag(task._id), {
                        title: `TaskFlow Reminder: ${task.title}`,
                        body: task.description || "Your task reminder is due now.",
                        reminderTime
                    });
                });

                const existingNotifications = await registration.getNotifications({
                    includeTriggered: true
                });
                const existingByTag = new Map();

                for (const notification of existingNotifications) {
                    const tag = notification.tag || "";

                    if (!tag.startsWith(REMINDER_TAG_PREFIX)) {
                        continue;
                    }

                    existingByTag.set(tag, notification);

                    const nextReminder = nextReminders.get(tag);

                    if (!nextReminder || notification.timestamp !== nextReminder.reminderTime) {
                        notification.close();
                    }
                }

                for (const [tag, reminder] of nextReminders.entries()) {
                    if (isCancelled) {
                        return;
                    }

                    const existingNotification = existingByTag.get(tag);

                    if (existingNotification && existingNotification.timestamp === reminder.reminderTime) {
                        continue;
                    }

                    await registration.showNotification(reminder.title, {
                        tag,
                        body: reminder.body,
                        icon: "/notification-icon-192.png",
                        badge: "/notification-badge-96.png",
                        timestamp: reminder.reminderTime,
                        renotify: false,
                        showTrigger: new globalThis.TimestampTrigger(reminder.reminderTime),
                        data: {
                            url: "/dashboard"
                        }
                    });
                }
            } catch (error) {
                console.error("Unable to sync scheduled mobile reminders", error);
            }
        };

        syncScheduledNotifications();

        return () => {
            isCancelled = true;
        };
    }, [enabled, tasks]);
};
