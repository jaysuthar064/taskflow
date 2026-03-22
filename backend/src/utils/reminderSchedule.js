export const REMINDER_REPEAT_VALUES = Object.freeze({
    ONCE: "once",
    DAILY: "daily",
    WEEKLY: "weekly"
});

export const REMINDER_REPEAT_OPTIONS = Object.values(REMINDER_REPEAT_VALUES);

const copyTimeFromSource = (targetDate, sourceDate) => {
    targetDate.setHours(
        sourceDate.getHours(),
        sourceDate.getMinutes(),
        sourceDate.getSeconds(),
        sourceDate.getMilliseconds()
    );

    return targetDate;
};

const getNextDailyReminder = (sourceDate, referenceDate) => {
    const candidate = copyTimeFromSource(new Date(referenceDate), sourceDate);

    if (candidate <= referenceDate) {
        candidate.setDate(candidate.getDate() + 1);
    }

    return candidate;
};

const getNextWeeklyReminder = (sourceDate, reminderWeekdays, referenceDate) => {
    if (!Array.isArray(reminderWeekdays) || reminderWeekdays.length === 0) {
        return null;
    }

    for (let offset = 0; offset < 8; offset += 1) {
        const candidate = copyTimeFromSource(new Date(referenceDate), sourceDate);
        candidate.setDate(referenceDate.getDate() + offset);

        if (!reminderWeekdays.includes(candidate.getDay())) {
            continue;
        }

        if (candidate > referenceDate) {
            return candidate;
        }
    }

    return null;
};

export const getNextReminderOccurrence = ({
    currentReminder,
    reminderRepeat = REMINDER_REPEAT_VALUES.ONCE,
    reminderWeekdays = [],
    now = new Date()
}) => {
    if (!currentReminder) {
        return null;
    }

    const sourceDate = currentReminder instanceof Date ? currentReminder : new Date(currentReminder);
    const referenceDate = now instanceof Date ? now : new Date(now);

    if (Number.isNaN(sourceDate.getTime()) || Number.isNaN(referenceDate.getTime())) {
        return null;
    }

    if (reminderRepeat === REMINDER_REPEAT_VALUES.DAILY) {
        return getNextDailyReminder(sourceDate, referenceDate);
    }

    if (reminderRepeat === REMINDER_REPEAT_VALUES.WEEKLY) {
        return getNextWeeklyReminder(sourceDate, reminderWeekdays, referenceDate);
    }

    return null;
};
