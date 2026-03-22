export const REMINDER_REPEAT_VALUES = Object.freeze({
  ONCE: "once",
  DAILY: "daily",
  WEEKLY: "weekly"
});

export const REMINDER_MODE_VALUES = Object.freeze({
  NONE: "none",
  ONCE: REMINDER_REPEAT_VALUES.ONCE,
  DAILY: REMINDER_REPEAT_VALUES.DAILY,
  CUSTOM: REMINDER_REPEAT_VALUES.WEEKLY
});

export const REMINDER_MODE_OPTIONS = [
  { value: REMINDER_MODE_VALUES.NONE, label: "None" },
  { value: REMINDER_MODE_VALUES.ONCE, label: "Once" },
  { value: REMINDER_MODE_VALUES.DAILY, label: "Every day" },
  { value: REMINDER_MODE_VALUES.CUSTOM, label: "Custom" }
];

export const REMINDER_REPEAT_OPTIONS = [
  { value: REMINDER_REPEAT_VALUES.ONCE, label: "Once" },
  { value: REMINDER_REPEAT_VALUES.DAILY, label: "Every day" },
  { value: REMINDER_REPEAT_VALUES.WEEKLY, label: "Custom" }
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

export const getQuickReminderLocalValue = (minutesFromNow = 1) => {
  const nextReminder = new Date(Date.now() + Math.max(1, minutesFromNow) * 60 * 1000);
  nextReminder.setSeconds(0, 0);

  const offset = nextReminder.getTimezoneOffset();
  const localDate = new Date(nextReminder.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
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

export const getReminderMode = (reminderValue, reminderRepeat) => {
  const normalizedRepeat = normalizeReminderRepeat(reminderRepeat);

  if (!toIsoOrNull(reminderValue)) {
    return normalizedRepeat === REMINDER_REPEAT_VALUES.ONCE
      ? REMINDER_MODE_VALUES.NONE
      : normalizedRepeat;
  }

  return normalizedRepeat;
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

export const getDefaultReminderWeekdays = (reminderValue) => {
  const normalizedReminder = toIsoOrNull(reminderValue);
  const sourceDate = normalizedReminder ? new Date(normalizedReminder) : new Date();

  if (Number.isNaN(sourceDate.getTime())) {
    return [];
  }

  return [sourceDate.getDay()];
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
