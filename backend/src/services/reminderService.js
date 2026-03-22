import Notification from "../models/Notification.js";
import Task from "../models/taskModel.js";
import { sendPushToUser } from "./pushNotificationService.js";
import { getNextReminderOccurrence, REMINDER_REPEAT_VALUES } from "../utils/reminderSchedule.js";

const REMINDER_INTERVAL_MS = 30 * 1000;
const OVERDUE_REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

const truncateReminderText = (value, maxLength = 72) => {
    const text = String(value || "").trim().replace(/\s+/g, " ");

    if (!text) {
        return "";
    }

    return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
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

const buildReminderMessage = (taskLabel, notificationStage = "due") => {
    if (notificationStage === "followup") {
        return `Still pending: ${taskLabel}.`;
    }

    return `Reminder: ${taskLabel} is due now.`;
};

const getReminderNotificationStage = (task, now) => {
    const reminderDate = new Date(task?.reminder);
    const reminderSentDate = task?.reminderNotificationSentAt ? new Date(task.reminderNotificationSentAt) : null;

    if (Number.isNaN(reminderDate.getTime())) {
        return "";
    }

    if (task?.reminderRepeat !== REMINDER_REPEAT_VALUES.ONCE) {
        return reminderSentDate ? "" : "due";
    }

    if (!reminderSentDate || Number.isNaN(reminderSentDate.getTime())) {
        return "due";
    }

    const followupThreshold = reminderDate.getTime() + OVERDUE_REMINDER_DELAY_MS;

    if (now.getTime() >= followupThreshold && reminderSentDate.getTime() < followupThreshold) {
        return "followup";
    }

    return "";
};

const processDueReminders = async () => {
    const now = new Date();

    const dueTasks = await Task.find({
        completed: false,
        archived: false,
        trashedAt: null,
        reminder: { $ne: null, $lte: now }
    }).select("_id user title description noteType checklistItems reminder reminderRepeat reminderWeekdays reminderNotificationSentAt");

    for (const task of dueTasks) {
        const notificationStage = getReminderNotificationStage(task, now);

        if (!notificationStage) {
            continue;
        }

        const claimFilter = {
            _id: task._id,
            completed: false,
            archived: false,
            trashedAt: null,
            reminder: { $ne: null, $lte: now }
        };

        if (notificationStage === "followup") {
            const followupThreshold = new Date(new Date(task.reminder).getTime() + OVERDUE_REMINDER_DELAY_MS);

            claimFilter.reminderRepeat = REMINDER_REPEAT_VALUES.ONCE;
            claimFilter.reminderNotificationSentAt = {
                $ne: null,
                $lt: followupThreshold
            };
        } else {
            claimFilter.reminderNotificationSentAt = null;
        }

        const claimedTask = await Task.findOneAndUpdate(
            claimFilter,
            {
                $set: {
                    reminderNotificationSentAt: now
                }
            },
            {
                new: true
            }
        );

        if (!claimedTask) {
            continue;
        }

        const reminderLabel = getReminderLabel(claimedTask);
        const reminderMessage = buildReminderMessage(reminderLabel, notificationStage);

        await Notification.create({
            user: claimedTask.user,
            message: reminderMessage,
            type: "reminder_due"
        });

        try {
            await sendPushToUser({
                userId: claimedTask.user,
                title: `TaskFlow Reminder: ${reminderLabel}`,
                body: reminderMessage,
                url: "/dashboard",
                tag: notificationStage === "followup"
                    ? `task-reminder-${claimedTask._id}-followup`
                    : `task-reminder-${claimedTask._id}`,
                data: {
                    taskId: claimedTask._id.toString(),
                    type: notificationStage === "followup" ? "reminder_overdue" : "reminder_due"
                }
            });
        } catch (pushError) {
            console.error(`[ReminderProcessor] Push delivery failed for task ${claimedTask._id}`, pushError);
        }

        if (claimedTask.reminderRepeat !== REMINDER_REPEAT_VALUES.ONCE) {
            const nextReminder = getNextReminderOccurrence({
                currentReminder: claimedTask.reminder,
                reminderRepeat: claimedTask.reminderRepeat,
                reminderWeekdays: claimedTask.reminderWeekdays,
                now
            });

            if (nextReminder) {
                await Task.findByIdAndUpdate(claimedTask._id, {
                    $set: {
                        reminder: nextReminder,
                        reminderNotificationSentAt: null
                    }
                });
            }
        }
    }
};

export const startReminderProcessor = () => {
    processDueReminders().catch((error) => {
        console.error("[ReminderProcessor] Initial run failed", error);
    });

    return setInterval(() => {
        processDueReminders().catch((error) => {
            console.error("[ReminderProcessor] Interval run failed", error);
        });
    }, REMINDER_INTERVAL_MS);
};
