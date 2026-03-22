import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckSquare,
  ImagePlus,
  Loader2,
  PencilLine,
  Plus,
  X
} from "lucide-react";
import DrawingCanvas from "./DrawingCanvas";
import NoteToolbarControls from "./NoteToolbarControls";
import {
  buildEmptyNoteDraft,
  createChecklistItem,
  draftHasMeaningfulContent,
  sanitizeDraftForSave
} from "./noteUtils";

const ChecklistEditor = ({ items, onChange }) => {
  const handleItemChange = (itemId, updates) => {
    onChange(
      items.map((item) => (item.itemId === itemId ? { ...item, ...updates } : item))
    );
  };

  const addItem = () => {
    onChange([
      ...items,
      createChecklistItem({ order: items.length })
    ]);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.itemId} className="flex items-start gap-3 rounded-2xl border border-[#3c4043] bg-[#202124] px-3 py-2.5">
          <button
            type="button"
            onClick={() => handleItemChange(item.itemId, { checked: !item.checked })}
            className={`mt-0.5 h-5 w-5 rounded-full border transition-colors ${
              item.checked
                ? "border-[#8ab4f8] bg-[#8ab4f8]"
                : "border-[#5f6368] hover:border-[#8ab4f8]"
            }`}
          />
          <input
            type="text"
            value={item.text}
            onChange={(event) => handleItemChange(item.itemId, { text: event.target.value, order: index })}
            placeholder={`List item ${index + 1}`}
            className={`flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa0a6] ${
              item.checked ? "text-[#9aa0a6] line-through" : "text-[#e8eaed]"
            }`}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((currentItem) => currentItem.itemId !== item.itemId))}
            className="text-[#9aa0a6] transition-colors hover:text-[#f28b82]"
            title="Remove item"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center rounded-full border border-[#5f6368] px-3 py-2 text-sm font-medium text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:text-[#8ab4f8]"
      >
        <Plus size={16} className="mr-2" />
        Add item
      </button>
    </div>
  );
};

const NoteComposer = ({
  initialMode = "text",
  autoExpand = false,
  onCreateNote,
  availableLabels = [],
  onEnsureLabel
}) => {
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(buildEmptyNoteDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const patchDraft = (updates) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...updates
    }));
  };

  const resetComposer = useCallback(() => {
    setExpanded(false);
    setDraft(buildEmptyNoteDraft());
    setErrorMessage("");
  }, []);

  const commitNote = useCallback(async () => {
    if (!draftHasMeaningfulContent(draft) || isSaving) {
      resetComposer();
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await onCreateNote(sanitizeDraftForSave(draft));
      resetComposer();
    } catch (error) {
      setErrorMessage(error.message || "Unable to save this task.");
      setExpanded(true);
    } finally {
      setIsSaving(false);
    }
  }, [draft, isSaving, onCreateNote, resetComposer]);

  const openComposer = useCallback((noteType = "text") => {
    setExpanded(true);
    setDraft((currentDraft) => ({
      ...currentDraft,
      noteType,
      checklistItems: noteType === "checklist" && currentDraft.checklistItems.length === 0
        ? [createChecklistItem()]
        : currentDraft.checklistItems
    }));
  }, []);

  useEffect(() => {
    if (!autoExpand) {
      return;
    }

    openComposer(initialMode);

    if (initialMode === "image") {
      window.setTimeout(() => {
        fileInputRef.current?.click();
      }, 0);
    }
  }, [autoExpand, initialMode, openComposer]);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        commitNote();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [commitNote, expanded]);

  const handleQuickImage = () => {
    openComposer("image");
    fileInputRef.current?.click();
  };

  const handleImagePick = (event) => {
    const [file] = Array.from(event.target.files || []);

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((currentDraft) => ({
        ...currentDraft,
        noteType: "image",
        imageData: String(reader.result || "")
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div ref={wrapperRef} className="mx-auto w-full max-w-3xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImagePick}
      />

      <div
        className={`rounded-[1.75rem] border border-[#5f6368] bg-[#303134] px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-200 min-[360px]:px-4 ${
          expanded ? "shadow-[0_8px_24px_rgba(0,0,0,0.45)]" : "hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
        }`}
      >
        {!expanded ? (
          <div className="flex items-center gap-1.5 min-[360px]:gap-3">
            <button
              type="button"
              onClick={() => openComposer("text")}
              className="flex-1 rounded-full px-2 py-2 text-left text-sm text-[#9aa0a6]"
            >
              Add a task...
            </button>

            <button
              type="button"
              onClick={() => openComposer("checklist")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#3c4043] hover:text-[#e8eaed] min-[360px]:h-9 min-[360px]:w-9"
              title="New checklist"
            >
              <CheckSquare size={17} className="min-[360px]:h-[18px] min-[360px]:w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => openComposer("drawing")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#3c4043] hover:text-[#e8eaed] min-[360px]:h-9 min-[360px]:w-9"
              title="Add sketch"
            >
              <PencilLine size={17} className="min-[360px]:h-[18px] min-[360px]:w-[18px]" />
            </button>
            <button
              type="button"
              onClick={handleQuickImage}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#3c4043] hover:text-[#e8eaed] min-[360px]:h-9 min-[360px]:w-9"
              title="Add image"
            >
              <ImagePlus size={17} className="min-[360px]:h-[18px] min-[360px]:w-[18px]" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <input
              type="text"
              value={draft.title}
              onChange={(event) => patchDraft({ title: event.target.value })}
              placeholder="Task title"
              className="w-full bg-transparent text-base font-medium text-[#e8eaed] outline-none placeholder:text-[#9aa0a6]"
            />

            {draft.noteType === "checklist" ? (
              <ChecklistEditor
                items={draft.checklistItems}
                onChange={(checklistItems) => patchDraft({ checklistItems })}
              />
            ) : draft.noteType === "drawing" ? (
              <DrawingCanvas
                value={draft.imageData}
                onChange={(imageData) => patchDraft({ imageData, noteType: "drawing" })}
              />
            ) : (
              <div className="space-y-3">
                {draft.imageData && (
                  <div className="overflow-hidden rounded-[1.5rem] border border-[#5f6368] bg-[#202124]">
                    <img
                      src={draft.imageData}
                      alt="Selected task attachment"
                      className="max-h-72 w-full object-cover"
                    />
                  </div>
                )}
                <textarea
                  value={draft.description}
                  onChange={(event) => patchDraft({ description: event.target.value })}
                  placeholder="Add task details"
                  className="min-h-[120px] w-full resize-none bg-transparent text-sm leading-6 text-[#e8eaed] outline-none placeholder:text-[#9aa0a6]"
                />
              </div>
            )}

            {errorMessage && (
              <p className="rounded-2xl border border-[#8c3c3c] bg-[#47292b] px-4 py-3 text-sm text-[#f28b82]">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-[#3c4043] pt-3 sm:flex-row sm:items-center sm:justify-between">
              <NoteToolbarControls
                draft={draft}
                onPatchDraft={patchDraft}
                availableLabels={availableLabels}
                onEnsureLabel={onEnsureLabel}
                compact
              />

              <button
                type="button"
                onClick={commitNote}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[#e8eaed] transition-colors hover:bg-[#3c4043] disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteComposer;
