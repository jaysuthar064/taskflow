import { useEffect } from "react";
import { registerPushServiceWorker } from "../utils/pushNotifications";
import { REMINDER_REPEAT_VALUES } from "../components/tasks/taskReminderUtils";

const REMINDER_TAG_PREFIX = "task-reminder-";
const OVERDUE_REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

const truncateReminderText = (value, maxLength = 72) => {
    const text = String(value || "").trim().replace(/\s+/g, " ");

    if (!text) {
        return "";
    }

    return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}...` : text;
};

const getReminderLabel = (task) => {
    const title = truncateReminderText(task?.title, 72);

    if (title) {
        return title;
    }

    const checklistLabel = truncateReminderText(
        (task?.checklistItems || []).find((item) => item?.text?.trim())?.text,
        72
    );

    if (checklistLabel) {
        return checklistLabel;
    }

    const descriptionLabel = truncateReminderText(task?.description, 72);

    if (descriptionLabel) {
        return descriptionLabel;
    }

    if (task?.noteType === "image") {
        return "Image task";
    }

    if (task?.noteType === "drawing") {
        return "Sketch task";
    }

    return "Untitled task";
};

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

const buildReminderTag = (taskId, suffix = "due") => `${REMINDER_TAG_PREFIX}${taskId}-${suffix}`;

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
                    if (!task?.reminder || task.completed || task.archived || task.trashedAt) {
                        return;
                    }

                    const reminderTime = new Date(task.reminder).getTime();

                    if (Number.isNaN(reminderTime)) {
                        return;
                    }

                    const reminderLabel = getReminderLabel(task);
                    const reminderBody = task.description || task.checklistItems?.[0]?.text || "A task reminder is due now.";

                    if (reminderTime > now) {
                        nextReminders.set(buildReminderTag(task._id), {
                            title: `TaskFlow Reminder: ${reminderLabel}`,
                            body: reminderBody,
                            reminderTime
                        });
                    }

                    if ((task.reminderRepeat || REMINDER_REPEAT_VALUES.ONCE) === REMINDER_REPEAT_VALUES.ONCE) {
                        const followupTime = reminderTime + OVERDUE_REMINDER_DELAY_MS;

                        if (followupTime > now) {
                            nextReminders.set(buildReminderTag(task._id, "followup"), {
                                title: `TaskFlow Reminder: ${reminderLabel}`,
                                body: `Still pending: ${reminderLabel}.`,
                                reminderTime: followupTime
                            });
                        }
                    }
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
