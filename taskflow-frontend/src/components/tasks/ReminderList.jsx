import React from "react";
import { Bell, CalendarClock, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { formatReminderRepeat, formatReminderTime } from "./taskReminderUtils";

const ReminderList = ({ tasks = [], onDelete, onToggle }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (safeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Bell className="text-surface-300 mb-3" size={40} />
        <p className="text-surface-500 font-medium">No reminders yet</p>
        <p className="text-sm text-surface-400 mt-1">Add a reminder to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {safeTasks.map((task) => {
        const reminderTime = new Date(task.reminder).getTime();
        const isOverdue = reminderTime <= new Date().getTime();
        const repeatLabel = formatReminderRepeat(task.reminderRepeat, task.reminderWeekdays);

        return (
          <div
            key={task._id}
            className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm transition-colors hover:border-primary-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-semibold text-surface-900 break-words">
                    {task.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      isOverdue
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}
                  >
                    {isOverdue ? "Overdue" : "Upcoming"}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-surface-500 mt-2 break-words">{task.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-surface-500 mt-3">
                  <CalendarClock size={14} className={isOverdue ? "text-red-500" : "text-primary-500"} />
                  <span>{formatReminderTime(task.reminder)}</span>
                </div>
                {repeatLabel && (
                  <p className="mt-2 text-xs font-semibold text-surface-500">{repeatLabel}</p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onToggle(task)}
                  className={`p-2 rounded-full transition-colors ${
                    task.completed
                      ? "text-green-600 bg-green-50"
                      : "text-surface-400 hover:text-primary-500 hover:bg-primary-50"
                  }`}
                  title={task.completed ? "Mark as pending" : "Mark as done"}
                >
                  {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-2 rounded-full text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReminderList;
