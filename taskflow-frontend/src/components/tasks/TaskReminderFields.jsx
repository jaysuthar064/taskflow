import React from "react";
import { CalendarClock, Repeat2 } from "lucide-react";
import {
  REMINDER_REPEAT_OPTIONS,
  REMINDER_REPEAT_VALUES,
  WEEKDAY_OPTIONS
} from "./taskReminderUtils";

const TaskReminderFields = ({
  reminderValue,
  onReminderChange,
  reminderRepeat,
  onReminderRepeatChange,
  reminderWeekdays,
  onToggleWeekday,
  min = "",
  disabled = false,
  compact = false
}) => {
  const fieldSpacing = compact ? "space-y-2" : "space-y-3";

  return (
    <div className={fieldSpacing}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="ml-1 inline-flex items-center text-sm font-semibold text-surface-700">
            <CalendarClock size={15} className="mr-2" />
            Reminder
          </span>
          <input
            type="datetime-local"
            value={reminderValue}
            min={min}
            disabled={disabled}
            onChange={(event) => onReminderChange(event.target.value)}
            className="input-field py-3 text-sm"
          />
        </label>

        <label className="space-y-2">
          <span className="ml-1 inline-flex items-center text-sm font-semibold text-surface-700">
            <Repeat2 size={15} className="mr-2" />
            Repeat
          </span>
          <select
            value={reminderRepeat}
            disabled={disabled}
            onChange={(event) => onReminderRepeatChange(event.target.value)}
            className="input-field py-3 text-sm"
          >
            {REMINDER_REPEAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {reminderRepeat === REMINDER_REPEAT_VALUES.WEEKLY && (
        <div className="space-y-2">
          <p className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-surface-500">
            Days
          </p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_OPTIONS.map((dayOption) => {
              const isActive = reminderWeekdays.includes(dayOption.value);

              return (
                <button
                  key={dayOption.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggleWeekday(dayOption.value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                    isActive
                      ? "border-primary-300 bg-primary-50 text-primary-700"
                      : "border-surface-200 bg-white text-surface-500 hover:border-primary-200 hover:text-primary-600"
                  } ${disabled ? "opacity-60" : ""}`}
                >
                  {dayOption.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReminderFields;
