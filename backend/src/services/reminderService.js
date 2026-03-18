import Notification from "../models/Notification.js";
import Task from "../models/taskModel.js";
import { sendPushToUser } from "./pushNotificationService.js";

const REMINDER_INTERVAL_MS = 30 * 1000;

const buildReminderMessage = (taskTitle) => `Reminder: ${taskTitle} is due now.`;

const processDueReminders = async () => {
    const now = new Date();

    const dueTasks = await Task.find({
        completed: false,
        reminder: { $ne: null, $lte: now },
        reminderNotificationSentAt: null
    }).select("_id user title reminder");

    for (const task of dueTasks) {
        const claimedTask = await Task.findOneAndUpdate(
            {
                _id: task._id,
                completed: false,
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

        await Notification.create({
            user: claimedTask.user,
            message: buildReminderMessage(claimedTask.title),
            type: "reminder_due"
        });

        await sendPushToUser({
            userId: claimedTask.user,
            title: `TaskFlow Reminder: ${claimedTask.title}`,
            body: buildReminderMessage(claimedTask.title),
            url: "/dashboard",
            tag: `task-reminder-${claimedTask._id}`,
            data: {
                taskId: claimedTask._id.toString(),
                type: "reminder_due"
            }
        });
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
