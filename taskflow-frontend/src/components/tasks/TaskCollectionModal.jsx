import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Layers3,
  Loader2,
  PencilLine,
  Plus,
  Save,
  Trash2,
  X
} from "lucide-react";
import TaskReminderFields from "./TaskReminderFields";
import {
  buildReminderPayload,
  getLocalMinReminder,
  getTaskReminderDraft,
  toggleReminderWeekday,
  toDateTimeLocalValue
} from "./taskReminderUtils";

const buildDrafts = (collection) =>
  Object.fromEntries(
    (collection?.tasks || []).map((task) => [
      task._id,
      { description: task.description || "", ...getTaskReminderDraft(task) }
    ])
  );

const TaskCollectionModal = ({
  collection,
  onClose,
  onRenameCollection,
  onCreateCollectionItem,
  onUpdateCollectionItem,
  onDeleteCollectionItem,
  onToggleCollectionItem,
  onDeleteCollection
}) => {
  const [collectionTitle, setCollectionTitle] = useState(collection?.title || "");
  const [collectionMessage, setCollectionMessage] = useState({ text: "", type: "" });
  const [drafts, setDrafts] = useState(buildDrafts(collection));
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemReminder, setNewItemReminder] = useState("");
  const [newItemReminderRepeat, setNewItemReminderRepeat] = useState("once");
  const [newItemReminderWeekdays, setNewItemReminderWeekdays] = useState([]);
  const [activeAction, setActiveAction] = useState("");
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  useEffect(() => {
    setCollectionTitle(collection?.title || "");
    setDrafts(buildDrafts(collection));
    setNewItemDescription("");
    setNewItemReminder("");
    setNewItemReminderRepeat("once");
    setNewItemReminderWeekdays([]);
    setCollectionMessage({ text: "", type: "" });
    setActiveAction("");
  }, [collection]);

  const hasUnsavedTitle = useMemo(
    () => collectionTitle.trim() !== String(collection?.title || "").trim(),
    [collection?.title, collectionTitle]
  );

  if (!collection) {
    return null;
  }

  const messageTone = collectionMessage.type === "error"
    ? "border-red-100 bg-red-50 text-red-700"
    : collectionMessage.type === "success"
      ? "border-green-100 bg-green-50 text-green-700"
      : "border-surface-200 bg-surface-50 text-surface-700";

  const handleSaveCollectionTitle = async () => {
    const trimmedTitle = collectionTitle.trim();

    if (!trimmedTitle) {
      setCollectionMessage({
        text: "Card title is required.",
        type: "error"
      });
      return;
    }

    if (!hasUnsavedTitle) {
      setCollectionMessage({
        text: "Card title is already up to date.",
        type: "info"
      });
      return;
    }

    setActiveAction("rename");
    setCollectionMessage({ text: "", type: "" });

    try {
      await onRenameCollection(collection, trimmedTitle);
      setCollectionMessage({
        text: "Card title updated successfully.",
        type: "success"
      });
    } catch (error) {
      setCollectionMessage({
        text: error.message || "Unable to rename this card.",
        type: "error"
      });
    } finally {
      setActiveAction("");
    }
  };

  const handleCreateItem = async (event) => {
    event.preventDefault();
    const trimmedDescription = newItemDescription.trim();

    if (!trimmedDescription) {
      setCollectionMessage({
        text: "Add note details before creating a new card item.",
        type: "error"
      });
      return;
    }

    if (hasUnsavedTitle) {
      setCollectionMessage({
        text: "Save the card title before adding a new note item.",
        type: "error"
      });
      return;
    }

    setIsCreatingItem(true);
    setCollectionMessage({ text: "", type: "" });

    try {
      const reminderPayload = buildReminderPayload({
        reminderValue: newItemReminder,
        reminderRepeat: newItemReminderRepeat,
        reminderWeekdays: newItemReminderWeekdays,
        requireFuture: Boolean(newItemReminder)
      });

      await onCreateCollectionItem({
        title: collection.title,
        description: trimmedDescription,
        ...reminderPayload
      });
      setNewItemDescription("");
      setNewItemReminder("");
      setNewItemReminderRepeat("once");
      setNewItemReminderWeekdays([]);
      setCollectionMessage({
        text: "New note added to this card.",
        type: "success"
      });
    } catch (error) {
      setCollectionMessage({
        text: error.message || "Unable to add a new note item.",
        type: "error"
      });
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleSaveItem = async (task) => {
    const taskId = task._id;
    const nextDraft = drafts[taskId] || { description: "", ...getTaskReminderDraft(task) };
    const reminderChanged = nextDraft.reminder !== toDateTimeLocalValue(task.reminder);

    setActiveAction(`save-${taskId}`);
    setCollectionMessage({ text: "", type: "" });

    try {
      const reminderPayload = buildReminderPayload({
        reminderValue: nextDraft.reminder,
        reminderRepeat: nextDraft.reminderRepeat,
        reminderWeekdays: nextDraft.reminderWeekdays,
        requireFuture: reminderChanged && Boolean(nextDraft.reminder)
      });

      await onUpdateCollectionItem(taskId, {
        description: nextDraft.description.trim(),
        ...reminderPayload
      });
      setCollectionMessage({
        text: "Card item updated.",
        type: "success"
      });
    } catch (error) {
      setCollectionMessage({
        text: error.message || "Unable to update this card item.",
        type: "error"
      });
    } finally {
      setActiveAction("");
    }
  };

  const handleDeleteItem = async (taskId) => {
    const confirmed = window.confirm("Delete this note from the card?");

    if (!confirmed) {
      return;
    }

    setActiveAction(`delete-${taskId}`);
    setCollectionMessage({ text: "", type: "" });

    try {
      await onDeleteCollectionItem(taskId);
      setCollectionMessage({
        text: "Card item deleted.",
        type: "success"
      });
    } catch (error) {
      setCollectionMessage({
        text: error.message || "Unable to delete this card item.",
        type: "error"
      });
    } finally {
      setActiveAction("");
    }
  };

  const handleToggleItem = async (task) => {
    setActiveAction(`toggle-${task._id}`);
    setCollectionMessage({ text: "", type: "" });

    try {
      await onToggleCollectionItem(task);
    } catch (error) {
      setCollectionMessage({
        text: error.message || "Unable to update this card item.",
        type: "error"
      });
    } finally {
      setActiveAction("");
    }
  };

  const handleDeleteWholeCollection = async () => {
    const confirmed = window.confirm("Delete this whole task card and every note inside it?");

    if (!confirmed) {
      return;
    }

    setIsDeletingCollection(true);
    setCollectionMessage({ text: "", type: "" });

    try {
      await onDeleteCollection(collection);
      onClose();
    } catch (error) {
      setCollectionMessage({
        text: error.message || "Unable to delete this card.",
        type: "error"
      });
    } finally {
      setIsDeletingCollection(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-hidden rounded-t-[2rem] border border-surface-200 bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[2rem]">
        <div className="flex items-center justify-between gap-3 border-b border-surface-100 bg-gradient-to-r from-primary-50 via-white to-amber-50 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-600">Task Card</p>
            <h3 className="mt-1 text-lg sm:text-2xl font-bold text-surface-900 break-words">{collection.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-surface-500 hover:bg-white hover:text-surface-900 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(94vh-76px)] overflow-y-auto p-4 sm:max-h-[calc(92vh-88px)] sm:p-6 space-y-6">
          {collectionMessage.text && (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${messageTone}`}>
              {collectionMessage.text}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-[1.5rem] border border-surface-200 bg-surface-50/80 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-surface-500">Details</p>
                  <p className="mt-1 text-sm text-surface-600">Update the title or delete this card.</p>
                </div>
                <Layers3 size={18} className="text-primary-500" />
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={collectionTitle}
                  onChange={(event) => setCollectionTitle(event.target.value)}
                  className="input-field py-3 text-sm"
                  placeholder="Card title"
                />
                <div className="flex flex-col min-[420px]:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveCollectionTitle}
                    disabled={activeAction === "rename"}
                    className="btn-primary flex items-center justify-center px-5 py-3"
                  >
                    {activeAction === "rename" ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                    Save Title
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteWholeCollection}
                    disabled={isDeletingCollection}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    {isDeletingCollection ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
                    Delete Card
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateItem} className="rounded-[1.5rem] border border-surface-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-surface-500">Add Item</p>
                  <p className="mt-1 text-sm text-surface-600">Add another item to this card.</p>
                </div>
                <Plus size={18} className="text-primary-500" />
              </div>

              <div className="mt-4 space-y-3">
                <textarea
                  value={newItemDescription}
                  onChange={(event) => setNewItemDescription(event.target.value)}
                  placeholder="Write the next note, task detail, or checklist point..."
                  className="input-field min-h-[120px] resize-none py-3 text-sm"
                />
                <TaskReminderFields
                  reminderValue={newItemReminder}
                  onReminderChange={setNewItemReminder}
                  reminderRepeat={newItemReminderRepeat}
                  onReminderRepeatChange={setNewItemReminderRepeat}
                  reminderWeekdays={newItemReminderWeekdays}
                  onReminderWeekdaysChange={setNewItemReminderWeekdays}
                  onToggleWeekday={(weekdayValue) =>
                    setNewItemReminderWeekdays((currentWeekdays) => toggleReminderWeekday(currentWeekdays, weekdayValue))
                  }
                  min={getLocalMinReminder()}
                  compact
                />
                <button
                  type="submit"
                  disabled={isCreatingItem}
                  className="btn-primary flex w-full items-center justify-center px-5 py-3"
                >
                  {isCreatingItem ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
                  Add Item
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-surface-500">Items</p>
                <p className="mt-1 text-sm text-surface-600">Edit any item and save your changes.</p>
              </div>
              <span className="rounded-full bg-surface-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-surface-600">
                {collection.tasks.length} items
              </span>
            </div>

            {collection.tasks.map((task) => {
              const draft = drafts[task._id] || { description: "", ...getTaskReminderDraft(task) };
              const actionKey = activeAction;

              return (
                <div key={task._id} className="rounded-[1.5rem] border border-surface-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(task)}
                      disabled={actionKey === `toggle-${task._id}`}
                      className={`mt-1 shrink-0 rounded-full p-1 transition-colors ${
                        task.completed ? "text-emerald-600" : "text-surface-300 hover:text-primary-500"
                      }`}
                      title={task.completed ? "Mark as pending" : "Mark as done"}
                    >
                      {actionKey === `toggle-${task._id}` ? <Loader2 size={18} className="animate-spin" /> : task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-surface-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-surface-600">
                          <PencilLine size={12} className="mr-1.5" />
                          Editable
                        </span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                          task.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {task.completed ? "Done" : "Open"}
                        </span>
                      </div>

                      <textarea
                        value={draft.description}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [task._id]: {
                              ...current[task._id],
                              description: event.target.value
                            }
                          }))
                        }
                        className={`input-field min-h-[100px] resize-none py-3 text-sm ${
                          task.completed ? "text-surface-400" : ""
                        }`}
                        placeholder="Describe this note item"
                      />

                      <div className="flex flex-col gap-3">
                        <div className="flex-1">
                          <TaskReminderFields
                            reminderValue={draft.reminder}
                            onReminderChange={(value) =>
                              setDrafts((current) => ({
                                ...current,
                                [task._id]: {
                                  ...current[task._id],
                                  reminder: value
                                }
                              }))
                            }
                            reminderRepeat={draft.reminderRepeat}
                            onReminderRepeatChange={(value) =>
                              setDrafts((current) => ({
                                ...current,
                                [task._id]: {
                                  ...current[task._id],
                                  reminderRepeat: value
                                }
                              }))
                            }
                            reminderWeekdays={draft.reminderWeekdays || []}
                            onReminderWeekdaysChange={(value) =>
                              setDrafts((current) => ({
                                ...current,
                                [task._id]: {
                                  ...current[task._id],
                                  reminderWeekdays: value
                                }
                              }))
                            }
                            onToggleWeekday={(weekdayValue) =>
                              setDrafts((current) => ({
                                ...current,
                                [task._id]: {
                                  ...current[task._id],
                                  reminderWeekdays: toggleReminderWeekday(current[task._id]?.reminderWeekdays || [], weekdayValue)
                                }
                              }))
                            }
                            min={getLocalMinReminder()}
                            compact
                          />
                        </div>

                        <div className="flex flex-col min-[420px]:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => handleSaveItem(task)}
                            disabled={actionKey === `save-${task._id}`}
                            className="btn-primary inline-flex w-full min-[420px]:w-auto items-center justify-center px-4 py-3"
                          >
                            {actionKey === `save-${task._id}` ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Save size={15} className="mr-2" />}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(task._id)}
                            disabled={actionKey === `delete-${task._id}`}
                            className="inline-flex w-full min-[420px]:w-auto items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                          >
                            {actionKey === `delete-${task._id}` ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Trash2 size={15} className="mr-2" />}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCollectionModal;
