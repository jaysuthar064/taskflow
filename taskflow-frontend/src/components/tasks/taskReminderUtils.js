export const REMINDER_REPEAT_VALUES = Object.freeze({
  ONCE: "once",
  DAILY: "daily",
  WEEKLY: "weekly"
});

export const REMINDER_REPEAT_OPTIONS = [
  { value: REMINDER_REPEAT_VALUES.ONCE, label: "Does not repeat" },
  { value: REMINDER_REPEAT_VALUES.DAILY, label: "Every day" },
  { value: REMINDER_REPEAT_VALUES.WEEKLY, label: "Selected days" }
];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" }
];

export const getLocalMinReminder = () => {
  const nextMinute = new Date(Date.now() + 60 * 1000);
  nextMinute.setSeconds(0, 0);
  return nextMinute.toISOString().slice(0, 16);
};

export const toDateTimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const toIsoOrNull = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const normalizeReminderRepeat = (value) => {
  if (value === REMINDER_REPEAT_VALUES.DAILY || value === REMINDER_REPEAT_VALUES.WEEKLY) {
    return value;
  }

  return REMINDER_REPEAT_VALUES.ONCE;
};

export const normalizeReminderWeekdays = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((dayValue) => Number(dayValue)).filter((dayValue) => Number.isInteger(dayValue) && dayValue >= 0 && dayValue <= 6))]
    .sort((firstDay, secondDay) => firstDay - secondDay);
};

export const toggleReminderWeekday = (currentWeekdays, weekdayValue) => {
  const normalizedWeekdays = normalizeReminderWeekdays(currentWeekdays);

  if (normalizedWeekdays.includes(weekdayValue)) {
    return normalizedWeekdays.filter((dayValue) => dayValue !== weekdayValue);
  }

  return normalizeReminderWeekdays([...normalizedWeekdays, weekdayValue]);
};

export const getTaskReminderDraft = (task = {}) => ({
  reminder: toDateTimeLocalValue(task.reminder),
  reminderRepeat: normalizeReminderRepeat(task.reminderRepeat),
  reminderWeekdays: normalizeReminderWeekdays(task.reminderWeekdays)
});

export const buildReminderPayload = ({
  reminderValue,
  reminderRepeat,
  reminderWeekdays,
  requireFuture = false
}) => {
  const reminder = toIsoOrNull(reminderValue);
  const normalizedRepeat = normalizeReminderRepeat(reminderRepeat);
  const normalizedWeekdays = normalizeReminderWeekdays(reminderWeekdays);

  if (!reminder) {
    if (normalizedRepeat !== REMINDER_REPEAT_VALUES.ONCE || normalizedWeekdays.length > 0) {
      throw new Error("Add a reminder time first.");
    }

    return {
      reminder: null,
      reminderRepeat: REMINDER_REPEAT_VALUES.ONCE,
      reminderWeekdays: []
    };
  }

  const reminderDate = new Date(reminder);

  if (Number.isNaN(reminderDate.getTime())) {
    throw new Error("Reminder date is invalid.");
  }

  if (requireFuture && reminderDate.getTime() <= Date.now()) {
    throw new Error("Reminder must be in the future.");
  }

  if (normalizedRepeat === REMINDER_REPEAT_VALUES.WEEKLY && normalizedWeekdays.length === 0) {
    throw new Error("Select at least one day.");
  }

  return {
    reminder,
    reminderRepeat: normalizedRepeat,
    reminderWeekdays: normalizedRepeat === REMINDER_REPEAT_VALUES.WEEKLY ? normalizedWeekdays : []
  };
};

export const formatReminderTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatReminderRepeat = (reminderRepeat, reminderWeekdays = []) => {
  const normalizedRepeat = normalizeReminderRepeat(reminderRepeat);

  if (normalizedRepeat === REMINDER_REPEAT_VALUES.DAILY) {
    return "Every day";
  }

  if (normalizedRepeat !== REMINDER_REPEAT_VALUES.WEEKLY) {
    return "";
  }

  const weekdayLabels = normalizeReminderWeekdays(reminderWeekdays)
    .map((dayValue) => WEEKDAY_OPTIONS.find((option) => option.value === dayValue)?.label)
    .filter(Boolean);

  return weekdayLabels.join(", ");
};
