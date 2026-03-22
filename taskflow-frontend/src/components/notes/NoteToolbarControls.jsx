import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Bell,
  CheckSquare,
  ImagePlus,
  MapPin,
  MoreVertical,
  Palette,
  Plus,
  Tag,
  Trash2,
  Undo2,
  UserPlus
} from "lucide-react";
import { NOTE_BACKGROUNDS, NOTE_COLORS, createChecklistItem, mergeUniqueStrings } from "./noteUtils";

const getDateTimeValue = (date) => {
  if (!date) {
    return "";
  }

  const nextDate = new Date(date);

  if (Number.isNaN(nextDate.getTime())) {
    return "";
  }

  const offset = nextDate.getTimezoneOffset();
  return new Date(nextDate.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
};

const toIsoOrNull = (value) => {
  if (!value) {
    return null;
  }

  const nextDate = new Date(value);
  return Number.isNaN(nextDate.getTime()) ? null : nextDate.toISOString();
};

const getReminderPreset = (preset) => {
  const now = new Date();

  if (preset === "laterToday") {
    const laterToday = new Date(now);
    laterToday.setHours(Math.max(now.getHours() + 3, 18), 0, 0, 0);
    return laterToday.toISOString();
  }

  if (preset === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString();
  }

  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);
  return nextWeek.toISOString();
};

const IconButton = ({ label, onClick, active = false, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
      active
        ? "border-[#8ab4f8] bg-[#1f3b5b] text-[#8ab4f8]"
        : "border-transparent text-[#9aa0a6] hover:border-[#5f6368] hover:bg-[#3c4043] hover:text-[#e8eaed]"
    }`}
    title={label}
    aria-label={label}
  >
    {children}
  </button>
);

const NoteToolbarControls = ({
  draft,
  onPatchDraft,
  availableLabels = [],
  onEnsureLabel,
  onArchiveToggle,
  onTrash,
  onRestore,
  onDeleteForever,
  compact = false,
  popoverPlacement = "bottom"
}) => {
  const wrapperRef = useRef(null);
  const imageInputRef = useRef(null);
  const [openPopover, setOpenPopover] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [newLabel, setNewLabel] = useState("");
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenPopover("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const labelOptions = useMemo(
    () => mergeUniqueStrings(availableLabels, draft.labels || []),
    [availableLabels, draft.labels]
  );

  const toggleLabel = async (label) => {
    const nextLabels = draft.labels?.some((currentLabel) => currentLabel.toLowerCase() === label.toLowerCase())
      ? draft.labels.filter((currentLabel) => currentLabel.toLowerCase() !== label.toLowerCase())
      : [...(draft.labels || []), label];

    onPatchDraft({ labels: mergeUniqueStrings(nextLabels) });

    if (onEnsureLabel) {
      await onEnsureLabel(label);
    }
  };

  const handleCreateLabel = async () => {
    const trimmedLabel = newLabel.trim().replace(/^#/, "");

    if (!trimmedLabel) {
      return;
    }

    await toggleLabel(trimmedLabel);
    setNewLabel("");
  };

  const addCollaborator = () => {
    const normalizedEmail = collaboratorEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    onPatchDraft({
      collaborators: mergeUniqueStrings(draft.collaborators || [], normalizedEmail)
    });
    setCollaboratorEmail("");
  };

  const handleImagePick = async (event) => {
    const [file] = Array.from(event.target.files || []);

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onPatchDraft({
        imageData: String(reader.result || ""),
        noteType: "image"
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const toggleChecklistMode = () => {
    if (draft.noteType === "checklist") {
      const description = draft.description || (draft.checklistItems || []).map((item) => item.text).filter(Boolean).join("\n");
      onPatchDraft({
        noteType: "text",
        description,
        checklistItems: []
      });
      setOpenPopover("");
      return;
    }

    const checklistItems = (draft.description || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => createChecklistItem({ text: line, order: index }));

    onPatchDraft({
      noteType: "checklist",
      checklistItems: checklistItems.length > 0 ? checklistItems : [createChecklistItem()],
      description: ""
    });
    setOpenPopover("");
  };

  const setDrawingMode = () => {
    onPatchDraft({
      noteType: "drawing"
    });
    setOpenPopover("");
  };

  const applyReminderPreset = (preset) => {
    onPatchDraft({
      reminder: getReminderPreset(preset),
      reminderRepeat: "once",
      reminderWeekdays: []
    });
    setOpenPopover("");
  };

  const toolbarGapClass = compact ? "gap-1.5" : "gap-2";
  const openDownward = popoverPlacement !== "top";
  const mobilePopoverClass = "max-[479px]:fixed max-[479px]:left-3 max-[479px]:right-3 max-[479px]:top-auto max-[479px]:bottom-3 max-[479px]:z-[150] max-[479px]:mt-0 max-[479px]:mb-0 max-[479px]:max-h-[min(70vh,32rem)] max-[479px]:overflow-y-auto";
  const leftPopoverClass = openDownward
    ? `absolute left-0 top-full z-30 mt-2 ${mobilePopoverClass}`
    : `absolute bottom-full left-0 z-30 mb-2 ${mobilePopoverClass}`;
  const rightPopoverClass = openDownward
    ? `absolute right-0 top-full z-30 mt-2 ${mobilePopoverClass}`
    : `absolute bottom-full right-0 z-30 mb-2 ${mobilePopoverClass}`;

  return (
    <div ref={wrapperRef} className={`relative z-20 flex flex-wrap items-center gap-y-2 max-[479px]:w-full max-[479px]:justify-between ${toolbarGapClass}`}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImagePick}
      />

      <IconButton label="Reminder" onClick={() => setOpenPopover((current) => current === "reminder" ? "" : "reminder")} active={openPopover === "reminder"}>
        <Bell size={16} />
      </IconButton>
      <IconButton label="Color and background" onClick={() => setOpenPopover((current) => current === "color" ? "" : "color")} active={openPopover === "color"}>
        <Palette size={16} />
      </IconButton>
      <IconButton label="Collaborators" onClick={() => setOpenPopover((current) => current === "collaborators" ? "" : "collaborators")} active={openPopover === "collaborators"}>
        <UserPlus size={16} />
      </IconButton>
      <IconButton label="Add image" onClick={() => imageInputRef.current?.click()}>
        <ImagePlus size={16} />
      </IconButton>

      {onArchiveToggle && (
        <IconButton label={draft.archived ? "Unarchive task" : "Archive task"} onClick={onArchiveToggle}>
          <Archive size={16} />
        </IconButton>
      )}

      {onRestore && (
        <IconButton label="Restore task" onClick={onRestore}>
          <Undo2 size={16} />
        </IconButton>
      )}

      <IconButton label="More options" onClick={() => setOpenPopover((current) => current === "more" ? "" : "more")} active={openPopover === "more"}>
        <MoreVertical size={16} />
      </IconButton>

      {openPopover === "color" && (
        <div className={`${leftPopoverClass} w-[min(22rem,calc(100vw-1.5rem))] rounded-[1.25rem] border border-[#5f6368] bg-[#202124] p-4 shadow-2xl`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">Colors</p>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {NOTE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onPatchDraft({ color: color.value })}
                className={`h-9 w-9 rounded-full border transition-transform hover:scale-105 ${
                  draft.color === color.value ? "ring-2 ring-[#8ab4f8] ring-offset-2 ring-offset-[#202124]" : ""
                }`}
                style={{ backgroundColor: color.fill, borderColor: color.border }}
                title={color.label}
              />
            ))}
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">Backgrounds</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {NOTE_BACKGROUNDS.filter((background) => background.value !== "none").map((background) => (
              <button
                key={background.value}
                type="button"
                onClick={() => onPatchDraft({ background: background.value })}
                className={`h-16 rounded-2xl border text-left text-xs font-medium text-[#e8eaed] transition-transform hover:scale-[1.02] ${
                  draft.background === background.value ? "ring-2 ring-[#8ab4f8] ring-offset-2 ring-offset-[#202124]" : ""
                }`}
                style={{ backgroundImage: background.preview, borderColor: "#5f6368", backgroundColor: "#2a2b2f" }}
              >
                <span className="block px-3 py-2">{background.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {openPopover === "reminder" && (
        <div className={`${leftPopoverClass} w-[min(20rem,calc(100vw-1.5rem))] rounded-[1.25rem] border border-[#5f6368] bg-[#202124] p-4 shadow-2xl`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">Reminder</p>
          <div className="mt-3 space-y-2">
            <button type="button" onClick={() => applyReminderPreset("laterToday")} className="w-full rounded-2xl border border-[#3c4043] px-3 py-2 text-left text-sm text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:bg-[#303134]">
              Later today
            </button>
            <button type="button" onClick={() => applyReminderPreset("tomorrow")} className="w-full rounded-2xl border border-[#3c4043] px-3 py-2 text-left text-sm text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:bg-[#303134]">
              Tomorrow
            </button>
            <button type="button" onClick={() => applyReminderPreset("nextWeek")} className="w-full rounded-2xl border border-[#3c4043] px-3 py-2 text-left text-sm text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:bg-[#303134]">
              Next week
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[#9aa0a6]">Pick date & time</span>
              <input
                type="datetime-local"
                value={getDateTimeValue(draft.reminder)}
                onChange={(event) => onPatchDraft({ reminder: toIsoOrNull(event.target.value) })}
                className="w-full rounded-2xl border border-[#5f6368] bg-[#303134] px-3 py-2 text-sm text-[#e8eaed] outline-none transition-colors focus:border-[#8ab4f8]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 inline-flex items-center text-xs font-medium text-[#9aa0a6]">
                <MapPin size={12} className="mr-1.5" />
                Pick place
              </span>
              <input
                type="text"
                value={draft.reminderPlace || ""}
                onChange={(event) => onPatchDraft({ reminderPlace: event.target.value })}
                placeholder="Office, grocery store, home"
                className="w-full rounded-2xl border border-[#5f6368] bg-[#303134] px-3 py-2 text-sm text-[#e8eaed] outline-none transition-colors focus:border-[#8ab4f8]"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onPatchDraft({
                    reminder: draft.reminder || null,
                    reminderPlace: draft.reminderPlace || ""
                  })
                }
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#8ab4f8] px-4 py-2 text-sm font-semibold text-[#202124] transition-transform hover:scale-[1.01]"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  onPatchDraft({
                    reminder: null,
                    reminderPlace: "",
                    reminderRepeat: "once",
                    reminderWeekdays: []
                  });
                  setOpenPopover("");
                }}
                className="inline-flex items-center justify-center rounded-full border border-[#5f6368] px-4 py-2 text-sm font-semibold text-[#e8eaed] hover:border-[#8ab4f8]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {openPopover === "collaborators" && (
        <div className={`${leftPopoverClass} w-[min(20rem,calc(100vw-1.5rem))] rounded-[1.25rem] border border-[#5f6368] bg-[#202124] p-4 shadow-2xl`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">Collaborators</p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              value={collaboratorEmail}
              onChange={(event) => setCollaboratorEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCollaborator();
                }
              }}
              placeholder="teammate@example.com"
              className="flex-1 rounded-full border border-[#5f6368] bg-[#303134] px-3 py-2 text-sm text-[#e8eaed] outline-none transition-colors focus:border-[#8ab4f8]"
            />
            <button
              type="button"
              onClick={addCollaborator}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#8ab4f8] text-[#202124]"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(draft.collaborators || []).map((collaborator) => (
              <button
                key={collaborator}
                type="button"
                onClick={() =>
                  onPatchDraft({
                    collaborators: draft.collaborators.filter((currentCollaborator) => currentCollaborator !== collaborator)
                  })
                }
                className="inline-flex items-center rounded-full border border-[#5f6368] px-3 py-1.5 text-xs text-[#e8eaed] hover:border-[#8ab4f8]"
              >
                {collaborator}
              </button>
            ))}
          </div>
        </div>
      )}

      {openPopover === "more" && (
        <div className={`${rightPopoverClass} w-[min(18rem,calc(100vw-1.5rem))] rounded-[1.25rem] border border-[#5f6368] bg-[#202124] p-2 shadow-2xl`}>
          <button
            type="button"
            onClick={toggleChecklistMode}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e8eaed] transition-colors hover:bg-[#303134]"
          >
            <CheckSquare size={15} className="mr-3 text-[#9aa0a6]" />
            {draft.noteType === "checklist" ? "Convert to text task" : "Show checklist"}
          </button>
          <button
            type="button"
            onClick={() => setOpenPopover("labels")}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e8eaed] transition-colors hover:bg-[#303134]"
          >
            <Tag size={15} className="mr-3 text-[#9aa0a6]" />
            Add label
          </button>
          <button
            type="button"
            onClick={setDrawingMode}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e8eaed] transition-colors hover:bg-[#303134]"
          >
            <Palette size={15} className="mr-3 text-[#9aa0a6]" />
            Open sketch pad
          </button>
          {onTrash && (
            <button
              type="button"
              onClick={onTrash}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#f28b82] transition-colors hover:bg-[#3c2c2c]"
            >
              <Trash2 size={15} className="mr-3" />
              Delete task
            </button>
          )}
          {onDeleteForever && (
            <button
              type="button"
              onClick={onDeleteForever}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#f28b82] transition-colors hover:bg-[#3c2c2c]"
            >
              <Trash2 size={15} className="mr-3" />
              Delete forever
            </button>
          )}
        </div>
      )}

      {openPopover === "labels" && (
        <div className={`${rightPopoverClass} w-[min(19rem,calc(100vw-1.5rem))] rounded-[1.25rem] border border-[#5f6368] bg-[#202124] p-4 shadow-2xl`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">Labels</p>
          <div className="mt-3 max-h-52 space-y-1 overflow-y-auto pr-1">
            {labelOptions.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#5f6368] px-3 py-4 text-center text-sm text-[#9aa0a6]">
                No labels yet.
              </p>
            )}
            {labelOptions.map((label) => {
              const checked = draft.labels?.some((currentLabel) => currentLabel.toLowerCase() === label.toLowerCase());

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    checked ? "bg-[#1f3b5b] text-[#8ab4f8]" : "text-[#e8eaed] hover:bg-[#303134]"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`h-4 w-4 rounded border ${checked ? "border-[#8ab4f8] bg-[#8ab4f8]" : "border-[#5f6368]"}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCreateLabel();
                }
              }}
              placeholder="Create label"
              className="flex-1 rounded-full border border-[#5f6368] bg-[#303134] px-3 py-2 text-sm text-[#e8eaed] outline-none transition-colors focus:border-[#8ab4f8]"
            />
            <button
              type="button"
              onClick={handleCreateLabel}
              className="inline-flex items-center justify-center rounded-full bg-[#8ab4f8] px-4 py-2 text-sm font-semibold text-[#202124]"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteToolbarControls;
