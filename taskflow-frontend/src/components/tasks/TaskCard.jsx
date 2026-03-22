import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, Loader2, Plus, Trash2 } from "lucide-react";
import { formatReminderRepeat, formatReminderTime } from "./taskReminderUtils";

const noteThemes = [
  {
    card: "bg-[#fff8dc] border-[#f0df9c]",
    tag: "bg-white/80 text-amber-700 border-amber-200",
    accent: "bg-amber-500"
  },
  {
    card: "bg-[#eef7ff] border-[#bfdcfb]",
    tag: "bg-white/80 text-sky-700 border-sky-200",
    accent: "bg-sky-500"
  },
  {
    card: "bg-[#f4f7ec] border-[#cfe0aa]",
    tag: "bg-white/80 text-lime-700 border-lime-200",
    accent: "bg-lime-500"
  },
  {
    card: "bg-[#fdf0f3] border-[#efc4d0]",
    tag: "bg-white/80 text-rose-700 border-rose-200",
    accent: "bg-rose-500"
  }
];

const getThemeForTitle = (title) => {
  const seed = Array.from(title || "").reduce((total, character) => total + character.charCodeAt(0), 0);
  return noteThemes[seed % noteThemes.length];
};

const TaskCard = ({
  taskGroup,
  onOpenCollection,
  onToggleTask,
  onDeleteCollection,
  onQuickAddItem
}) => {
  const theme = getThemeForTitle(taskGroup.title);
  const completedCount = taskGroup.tasks.filter((task) => task.completed).length;
  const previewTasks = taskGroup.tasks.slice(0, 4);
  const overdueCount = taskGroup.tasks.filter((task) => task.reminder && new Date(task.reminder) < new Date() && !task.completed).length;
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [cardMessage, setCardMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isComposerOpen) {
      textareaRef.current?.focus();
    }
  }, [isComposerOpen]);

  const handleQuickAdd = async () => {
    const trimmedDescription = newItemDescription.trim();

    if (!trimmedDescription) {
      setCardMessage("Write an item first.");
      return;
    }

    setIsSavingItem(true);
    setCardMessage("");

    try {
      await onQuickAddItem({
        title: taskGroup.title,
        description: trimmedDescription,
        reminder: null,
        reminderRepeat: "once",
        reminderWeekdays: []
      });

      setNewItemDescription("");
      setIsComposerOpen(false);
    } catch (error) {
      setCardMessage(error.message || "Unable to add this item.");
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteCollection = async () => {
    const confirmed = window.confirm("Delete this card and every item inside it?");

    if (!confirmed) {
      return;
    }

    setCardMessage("");

    try {
      await onDeleteCollection(taskGroup);
    } catch (error) {
      setCardMessage(error.message || "Unable to delete this card.");
    }
  };

  return (
    <article
      className={`group w-full rounded-[1.5rem] border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${theme.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpenCollection(taskGroup)}
            className="mt-2 text-left"
          >
            <h3 className="text-lg font-bold text-surface-900 break-words">{taskGroup.title}</h3>
          </button>
          <p className="mt-1 text-xs text-surface-600">
            {taskGroup.pendingCount} open / {completedCount} done
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${theme.tag}`}>
            {taskGroup.tasks.length} note{taskGroup.tasks.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => onOpenCollection(taskGroup)}
            className="rounded-full p-2 text-surface-500 transition-colors hover:bg-white/80 hover:text-surface-900"
            title="Open card"
          >
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {previewTasks.map((task) => {
          const reminderLabel = formatReminderTime(task.reminder);
          const repeatLabel = formatReminderRepeat(task.reminderRepeat, task.reminderWeekdays);
          const reminderMeta = [reminderLabel, repeatLabel].filter(Boolean).join(" | ");
          const previewText = task.description?.trim() || "Open card item";

          return (
            <div key={task._id} className="rounded-2xl border border-white/70 bg-white/80 px-3 py-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleTask(task)}
                  className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                    task.completed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-surface-300 bg-white text-surface-400 hover:border-primary-300 hover:text-primary-600"
                  }`}
                  title={task.completed ? "Mark as open" : "Mark as done"}
                >
                  {task.completed ? <CheckCircle2 size={13} /> : <span className={`h-2.5 w-2.5 rounded-full ${theme.accent}`} />}
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onOpenCollection(taskGroup)}
                    className="w-full text-left"
                  >
                    <p className={`text-sm leading-relaxed break-words ${task.completed ? "text-surface-400 line-through" : "text-surface-700"}`}>
                      {previewText}
                    </p>
                  </button>
                  {reminderMeta && (
                    <span className="mt-2 inline-flex items-center text-[10px] font-bold uppercase tracking-[0.16em] text-surface-500">
                      <Clock3 size={11} className="mr-1.5" />
                      {reminderMeta}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {taskGroup.tasks.length > previewTasks.length && (
          <div className="rounded-2xl border border-dashed border-white/80 bg-white/40 px-3 py-3 text-xs font-semibold text-surface-600">
            +{taskGroup.tasks.length - previewTasks.length} more items
          </div>
        )}
      </div>

      {cardMessage && (
        <p className="mt-3 text-xs font-semibold text-red-700">{cardMessage}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsComposerOpen(true)}
          className="inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-surface-700 transition-colors hover:bg-white"
        >
          <Plus size={13} className="mr-1.5" />
          Add item
        </button>
        <button
          type="button"
          onClick={() => onOpenCollection(taskGroup)}
          className="inline-flex items-center rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-surface-600 transition-colors hover:bg-white"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDeleteCollection}
          className="inline-flex items-center rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 size={13} className="mr-1.5" />
          Delete
        </button>
        {overdueCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-700 border border-red-200">
            {overdueCount} overdue
          </span>
        )}
      </div>

      {isComposerOpen && (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/85 p-3 shadow-sm">
          <textarea
            ref={textareaRef}
            value={newItemDescription}
            onChange={(event) => setNewItemDescription(event.target.value)}
            placeholder="Add an item..."
            className="input-field min-h-[96px] resize-none border-white bg-white/90 py-3 text-sm"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isSavingItem}
              className="btn-primary inline-flex items-center justify-center px-4 py-2.5 text-sm"
            >
              {isSavingItem ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Plus size={14} className="mr-2" />}
              Save item
            </button>
            <button
              type="button"
              onClick={() => {
                setIsComposerOpen(false);
                setNewItemDescription("");
                setCardMessage("");
              }}
              className="inline-flex items-center justify-center rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-600 transition-colors hover:bg-surface-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onOpenCollection(taskGroup)}
              className="inline-flex items-center justify-center rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-600 transition-colors hover:bg-surface-50"
            >
              More options
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default TaskCard;
