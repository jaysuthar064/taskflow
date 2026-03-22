import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Pin,
  Plus,
  X
} from "lucide-react";
import DrawingCanvas from "./DrawingCanvas";
import NoteToolbarControls from "./NoteToolbarControls";
import {
  createChecklistItem,
  getNoteVisuals,
  normalizeChecklistItemsForDraft,
  noteToDraft,
  sanitizeDraftForSave
} from "./noteUtils";

const reorderChecklistItems = (items, draggedItemId, targetItemId) => {
  const currentItems = normalizeChecklistItemsForDraft(items);
  const fromIndex = currentItems.findIndex((item) => item.itemId === draggedItemId);
  const toIndex = currentItems.findIndex((item) => item.itemId === targetItemId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return currentItems;
  }

  const nextItems = [...currentItems];
  const [draggedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, draggedItem);

  return nextItems.map((item, index) => ({
    ...item,
    order: index
  }));
};

const ChecklistItemRow = ({
  item,
  onToggle,
  onChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop
}) => (
  <div
    draggable
    onDragStart={() => onDragStart(item.itemId)}
    onDragOver={(event) => {
      event.preventDefault();
      onDragOver(item.itemId);
    }}
    onDrop={(event) => {
      event.preventDefault();
      onDrop(item.itemId);
    }}
    className="flex items-start gap-3 rounded-[1rem] border border-[#3c4043] bg-[#202124]/70 px-3 py-2.5"
  >
    <button
      type="button"
      onClick={onToggle}
      className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
        item.checked
          ? "border-[#8ab4f8] bg-[#8ab4f8] text-[#202124]"
          : "border-[#5f6368] text-[#9aa0a6] hover:border-[#8ab4f8] hover:text-[#8ab4f8]"
      }`}
    >
      {item.checked ? <CheckCircle2 size={14} /> : <Circle size={14} />}
    </button>
    <input
      type="text"
      value={item.text}
      onChange={(event) => onChange(event.target.value)}
      placeholder="List item"
      className={`flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa0a6] ${
        item.checked ? "text-[#9aa0a6] line-through" : "text-[#e8eaed]"
      }`}
    />
    <button
      type="button"
      onClick={onRemove}
      className="text-[#9aa0a6] transition-colors hover:text-[#f28b82]"
      title="Remove item"
    >
      <X size={16} />
    </button>
  </div>
);

const NoteEditorModal = ({
  note,
  searchQuery,
  availableLabels = [],
  onEnsureLabel,
  onUpdateNote,
  onTogglePin,
  onArchive,
  onTrash,
  onRestore,
  onDeleteForever,
  onClose
}) => {
  const [draft, setDraft] = useState(noteToDraft(note));
  const [saveState, setSaveState] = useState("Saved");
  const [checkedCollapsed, setCheckedCollapsed] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState("");
  const latestSavedRef = useRef(JSON.stringify(sanitizeDraftForSave(noteToDraft(note))));

  const patchDraft = (updates) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...updates
    }));
    setSaveState("Saving...");
  };

  const saveDraft = useCallback(async (draftToSave) => {
    const serializedDraft = JSON.stringify(sanitizeDraftForSave(draftToSave));

    if (serializedDraft === latestSavedRef.current) {
      setSaveState("Saved");
      return;
    }

    setSaveState("Saving...");

    try {
      const updatedNote = await onUpdateNote(note._id, sanitizeDraftForSave(draftToSave));
      latestSavedRef.current = JSON.stringify(sanitizeDraftForSave(noteToDraft(updatedNote || draftToSave)));
      setSaveState("Saved");
    } catch {
      setSaveState("Could not save");
    }
  }, [note._id, onUpdateNote]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      saveDraft(draft);
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draft, saveDraft]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        saveDraft(draft).finally(() => {
          onClose();
        });
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [draft, onClose, saveDraft]);

  const visuals = useMemo(() => getNoteVisuals(draft), [draft]);
  const checklistItems = normalizeChecklistItemsForDraft(draft.checklistItems || []);
  const uncheckedItems = checklistItems.filter((item) => !item.checked);
  const checkedItems = checklistItems.filter((item) => item.checked);

  const updateChecklistItems = (nextItems) => {
    patchDraft({
      checklistItems: normalizeChecklistItemsForDraft(nextItems)
    });
  };

  const addChecklistItem = () => {
    updateChecklistItems([
      ...checklistItems,
      createChecklistItem({ order: checklistItems.length })
    ]);
  };

  const handleArchive = async () => {
    await saveDraft(draft);
    await onArchive({ ...note, ...sanitizeDraftForSave(draft) });
    onClose();
  };

  const handleTrash = async () => {
    await saveDraft(draft);
    await onTrash({ ...note, ...sanitizeDraftForSave(draft) });
    onClose();
  };

  const handleRestore = async () => {
    await onRestore({ ...note, ...sanitizeDraftForSave(draft) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-2 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          saveDraft(draft).finally(() => {
            onClose();
          });
        }}
      />

      <div
        className="relative flex max-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:max-h-[92vh] sm:rounded-[1.75rem]"
        style={visuals.cardStyle}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">
            {saveState}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTogglePin({ ...note, ...sanitizeDraftForSave(draft) })}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                draft.pinned
                  ? "border-[#8ab4f8] bg-[#1f3b5b] text-[#8ab4f8]"
                  : "border-transparent text-[#9aa0a6] hover:border-[#5f6368] hover:bg-[#202124]/20 hover:text-[#e8eaed]"
              }`}
              title={draft.pinned ? "Unpin task" : "Pin task"}
            >
              <Pin size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                saveDraft(draft).finally(() => {
                  onClose();
                });
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#9aa0a6] transition-colors hover:border-[#5f6368] hover:bg-[#202124]/20 hover:text-[#e8eaed]"
              title="Close editor"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="space-y-5">
            <input
              type="text"
              value={draft.title}
              onChange={(event) => patchDraft({ title: event.target.value })}
              placeholder="Title"
              className="w-full break-words bg-transparent text-lg font-medium text-current outline-none placeholder:text-[#9aa0a6] sm:text-xl"
            />

            {draft.noteType === "checklist" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {uncheckedItems.map((item) => (
                    <ChecklistItemRow
                      key={item.itemId}
                      item={item}
                      onToggle={() =>
                        updateChecklistItems(
                          checklistItems.map((currentItem) =>
                            currentItem.itemId === item.itemId
                              ? { ...currentItem, checked: !currentItem.checked }
                              : currentItem
                          )
                        )
                      }
                      onChange={(text) =>
                        updateChecklistItems(
                          checklistItems.map((currentItem) =>
                            currentItem.itemId === item.itemId ? { ...currentItem, text } : currentItem
                          )
                        )
                      }
                      onRemove={() =>
                        updateChecklistItems(
                          checklistItems.filter((currentItem) => currentItem.itemId !== item.itemId)
                        )
                      }
                      onDragStart={setDraggedItemId}
                      onDragOver={() => {}}
                      onDrop={(targetItemId) =>
                        updateChecklistItems(reorderChecklistItems(checklistItems, draggedItemId, targetItemId))
                      }
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="inline-flex items-center rounded-full border border-[#5f6368] px-3 py-2 text-sm font-medium text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:text-[#8ab4f8]"
                >
                  <Plus size={16} className="mr-2" />
                  Add item
                </button>

                {checkedItems.length > 0 && (
                  <div className="rounded-[1rem] border border-white/10 bg-[#202124]/30 p-3">
                    <button
                      type="button"
                      onClick={() => setCheckedCollapsed((current) => !current)}
                      className="text-sm font-medium text-[#9aa0a6]"
                    >
                      {checkedCollapsed ? "Show" : "Hide"} checked items ({checkedItems.length})
                    </button>

                    {!checkedCollapsed && (
                      <div className="mt-3 space-y-2">
                        {checkedItems.map((item) => (
                          <ChecklistItemRow
                            key={item.itemId}
                            item={item}
                            onToggle={() =>
                              updateChecklistItems(
                                checklistItems.map((currentItem) =>
                                  currentItem.itemId === item.itemId
                                    ? { ...currentItem, checked: !currentItem.checked }
                                    : currentItem
                                )
                              )
                            }
                            onChange={(text) =>
                              updateChecklistItems(
                                checklistItems.map((currentItem) =>
                                  currentItem.itemId === item.itemId ? { ...currentItem, text } : currentItem
                                )
                              )
                            }
                            onRemove={() =>
                              updateChecklistItems(
                                checklistItems.filter((currentItem) => currentItem.itemId !== item.itemId)
                              )
                            }
                            onDragStart={setDraggedItemId}
                            onDragOver={() => {}}
                            onDrop={(targetItemId) =>
                              updateChecklistItems(reorderChecklistItems(checklistItems, draggedItemId, targetItemId))
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : draft.noteType === "drawing" ? (
              <DrawingCanvas
                value={draft.imageData}
                onChange={(imageData) => patchDraft({ imageData, noteType: "drawing" })}
              />
            ) : (
              <div className="space-y-4">
                {draft.imageData && (
                  <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#202124]/40">
                    <img
                      src={draft.imageData}
                      alt={draft.title || "Task attachment"}
                      className="max-h-80 w-full object-cover"
                    />
                  </div>
                )}
                <textarea
                  value={draft.description}
                  onChange={(event) => patchDraft({ description: event.target.value })}
                  placeholder="Add task details"
                  className="min-h-[160px] w-full resize-none bg-transparent text-sm leading-6 text-current/95 outline-none placeholder:text-[#9aa0a6] sm:min-h-[180px] sm:leading-7"
                />
              </div>
            )}
          </div>
        </div>

        <div className="relative z-20 border-t border-white/10 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <NoteToolbarControls
              draft={draft}
              onPatchDraft={patchDraft}
              availableLabels={availableLabels}
              onEnsureLabel={onEnsureLabel}
              onArchiveToggle={note.trashedAt ? null : handleArchive}
              onTrash={note.trashedAt ? null : handleTrash}
              onRestore={note.trashedAt ? handleRestore : null}
              onDeleteForever={note.trashedAt ? onDeleteForever : null}
              popoverPlacement="top"
            />

            <div className="text-xs text-[#9aa0a6]">
              {searchQuery ? "Search matches stay highlighted while editing." : "Changes save automatically."}
            </div>
          </div>
        </div>

        {saveState === "Saving..." && (
          <div className="pointer-events-none absolute bottom-5 right-5 inline-flex items-center rounded-full border border-[#5f6368] bg-[#202124]/90 px-3 py-2 text-xs text-[#e8eaed] shadow-lg">
            <Loader2 size={14} className="mr-2 animate-spin" />
            Saving...
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditorModal;
