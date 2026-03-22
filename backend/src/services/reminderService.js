import Notification from "../models/Notification.js";
import Task from "../models/taskModel.js";
import { sendPushToUser } from "./pushNotificationService.js";
import { getNextReminderOccurrence, REMINDER_REPEAT_VALUES } from "../utils/reminderSchedule.js";

const REMINDER_INTERVAL_MS = 30 * 1000;

const buildReminderMessage = (taskTitle) => `Reminder: ${taskTitle} is due now.`;

const processDueReminders = async () => {
    const now = new Date();

    const dueTasks = await Task.find({
        completed: false,
        archived: false,
        trashedAt: null,
        reminder: { $ne: null, $lte: now },
        reminderNotificationSentAt: null
    }).select("_id user title reminder reminderRepeat reminderWeekdays");

    for (const task of dueTasks) {
        const claimedTask = await Task.findOneAndUpdate(
            {
                _id: task._id,
                completed: false,
                archived: false,
                trashedAt: null,
                reminder: { $ne: null, $lte: now },
                reminderNotificationSentAt: null
            },
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

        const noteTitle = claimedTask.title || "Untitled note";

        await Notification.create({
            user: claimedTask.user,
            message: buildReminderMessage(noteTitle),
            type: "reminder_due"
        });

        try {
            await sendPushToUser({
                userId: claimedTask.user,
                title: `TaskFlow Reminder: ${noteTitle}`,
                body: buildReminderMessage(noteTitle),
                url: "/dashboard",
                tag: `task-reminder-${claimedTask._id}`,
                data: {
                    taskId: claimedTask._id.toString(),
                    type: "reminder_due"
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
