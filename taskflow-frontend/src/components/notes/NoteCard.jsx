import React, { useEffect, useRef, useState } from "react";
import {
  Archive,
  Bell,
  ImageIcon,
  MoreVertical,
  Pin,
  Undo2,
  Trash2
} from "lucide-react";
import {
  getNoteBodyPreview,
  getNoteReminderText,
  getNoteTitle,
  getNoteVisuals,
  normalizeChecklistItemsForDraft,
  splitHighlightedText
} from "./noteUtils";

const HighlightedText = ({ text, query, className = "" }) => (
  <span className={className}>
    {splitHighlightedText(text, query).map((segment, index) => (
      <span
        key={`${segment.value}-${index}`}
        className={segment.highlight ? "rounded bg-[#8ab4f8]/30 px-0.5 text-[#e8eaed]" : undefined}
      >
        {segment.value}
      </span>
    ))}
  </span>
);

const CollaboratorAvatar = ({ email }) => (
  <span
    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#5f6368] bg-[#202124] text-[11px] font-semibold text-[#e8eaed]"
    title={email}
  >
    {String(email || "U").slice(0, 1).toUpperCase()}
  </span>
);

const NoteCard = ({
  note,
  searchQuery,
  viewMode = "grid",
  isSelected = false,
  onSelect,
  onOpen,
  onToggleChecklistItem,
  onTogglePin,
  onArchive,
  onTrash
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const visuals = getNoteVisuals(note);
  const checklistItems = normalizeChecklistItemsForDraft(note.checklistItems || []);
  const previewItems = checklistItems.slice(0, 4);
  const reminderText = getNoteReminderText(note);
  const cardLayoutClass = viewMode === "list" ? "flex-col gap-4 min-[640px]:flex-row min-[640px]:gap-5" : "flex-col";
  const canToggleChecklistItems = note.noteType === "checklist" && typeof onToggleChecklistItem === "function";

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <article
      className={`smooth-motion group relative isolate flex w-full max-w-full break-inside-avoid cursor-pointer rounded-[1.25rem] border p-3 shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:z-30 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.26)] focus-within:z-30 max-[419px]:mx-auto max-[419px]:max-w-[22rem] max-[359px]:rounded-[1rem] min-[360px]:p-4 ${
        isSelected ? "ring-2 ring-[#8ab4f8]" : ""
      } ${isMobileMenuOpen ? "z-[90]" : isSelected ? "z-30" : "z-0"} ${cardLayoutClass}`}
      style={visuals.cardStyle}
      onClick={() => {
        onSelect?.(note._id);
        onOpen(note);
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onTogglePin(note);
        }}
        className={`smooth-motion smooth-lift absolute right-3 top-3 hidden h-8 w-8 items-center justify-center rounded-full border min-[600px]:inline-flex ${
          note.pinned
            ? "border-[#8ab4f8] bg-[#1f3b5b] text-[#8ab4f8]"
            : "border-transparent bg-[#202124]/20 text-[#9aa0a6] min-[600px]:opacity-0 min-[600px]:group-hover:opacity-100 hover:border-[#5f6368] hover:text-[#e8eaed]"
        }`}
        title={note.pinned ? "Unpin task" : "Pin task"}
      >
        <Pin size={15} />
      </button>

      <div ref={mobileMenuRef} className="absolute right-3 top-3 z-20 min-[600px]:hidden">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsMobileMenuOpen((current) => !current);
          }}
          className="smooth-motion smooth-lift inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-[#202124]/20 text-[#9aa0a6] hover:border-[#5f6368] hover:text-[#e8eaed]"
          title="More options"
          aria-label="More options"
          aria-expanded={isMobileMenuOpen}
        >
          <MoreVertical size={15} />
        </button>

        {isMobileMenuOpen && (
          <div className="smooth-panel absolute right-0 top-10 w-44 rounded-[1rem] border border-[#5f6368] bg-[#202124] p-1.5 shadow-2xl">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTogglePin(note);
                setIsMobileMenuOpen(false);
              }}
              className="smooth-motion flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#e8eaed] hover:translate-x-0.5 hover:bg-[#303134]"
            >
              <Pin size={15} className="mr-3 text-[#9aa0a6]" />
              {note.pinned ? "Unpin task" : "Pin task"}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onArchive(note);
                setIsMobileMenuOpen(false);
              }}
              className="smooth-motion flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#e8eaed] hover:translate-x-0.5 hover:bg-[#303134]"
            >
              {note.trashedAt ? (
                <Undo2 size={15} className="mr-3 text-[#9aa0a6]" />
              ) : (
                <Archive size={15} className="mr-3 text-[#9aa0a6]" />
              )}
              {note.trashedAt ? "Restore task" : note.archived ? "Unarchive task" : "Archive task"}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTrash(note);
                setIsMobileMenuOpen(false);
              }}
              className="smooth-motion flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[#f28b82] hover:translate-x-0.5 hover:bg-[#3c2c2c]"
            >
              <Trash2 size={15} className="mr-3" />
              {note.trashedAt ? "Delete forever" : "Delete task"}
            </button>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-3 pr-9 min-[360px]:pr-10">
        <div className="space-y-2">
          <h3 className="break-words text-[15px] font-medium leading-tight text-current [overflow-wrap:anywhere] min-[360px]:text-base">
            <HighlightedText text={getNoteTitle(note)} query={searchQuery} />
          </h3>

          {note.noteType === "image" && note.imageData && (
            <div className="overflow-hidden rounded-[1rem] border border-white/10">
              <img
                src={note.imageData}
                alt={getNoteTitle(note)}
                className="smooth-motion max-h-56 w-full object-cover group-hover:scale-[1.02]"
              />
            </div>
          )}

          {note.noteType === "drawing" && note.imageData && (
            <div className="overflow-hidden rounded-[1rem] border border-white/10 bg-[#232427]">
              <img
                src={note.imageData}
                alt="Task sketch"
                className="smooth-motion max-h-56 w-full object-cover group-hover:scale-[1.02]"
              />
            </div>
          )}

          {note.noteType === "checklist" ? (
            <div className="space-y-2">
              {previewItems.map((item) => (
                <div key={item.itemId} className="flex items-start gap-2 text-sm">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleChecklistItem?.(note, item.itemId);
                    }}
                    disabled={!canToggleChecklistItems}
                    className={`smooth-motion mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      item.checked
                        ? "border-[#8ab4f8] bg-[#8ab4f8] text-[#202124]"
                        : "border-[#9aa0a6] text-[#9aa0a6] hover:border-[#8ab4f8] hover:text-[#8ab4f8]"
                    } ${canToggleChecklistItems ? "" : "pointer-events-none"}`}
                    title={item.checked ? "Mark item as not done" : "Mark item as done"}
                    aria-label={item.checked ? "Mark item as not done" : "Mark item as done"}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.checked ? "bg-current" : ""}`} />
                  </button>
                  <HighlightedText
                    text={item.text}
                    query={searchQuery}
                    className={`${item.checked ? "text-[#9aa0a6] line-through" : "text-current"} [overflow-wrap:anywhere]`}
                  />
                </div>
              ))}
              {checklistItems.length > previewItems.length && (
                <p className="text-xs text-[#9aa0a6]">
                  +{checklistItems.length - previewItems.length} more items
                </p>
              )}
            </div>
          ) : (
            getNoteBodyPreview(note) && (
              <p className="max-h-32 overflow-hidden break-words text-sm leading-6 text-current/90 [overflow-wrap:anywhere]">
                <HighlightedText text={getNoteBodyPreview(note)} query={searchQuery} />
              </p>
            )
          )}
        </div>

        {(note.labels?.length > 0 || reminderText || note.collaborators?.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {reminderText && (
              <span className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-[#202124]/35 px-2.5 py-1 text-[11px] font-medium text-current [overflow-wrap:anywhere]">
                <Bell size={12} className="mr-1.5" />
                {reminderText}
              </span>
            )}
            {(note.labels || []).map((label) => (
              <span key={label} className="max-w-full rounded-full border border-white/10 bg-[#202124]/35 px-2.5 py-1 text-[11px] font-medium text-current [overflow-wrap:anywhere]">
                #{label}
              </span>
            ))}
            <div className="flex w-full items-center gap-1 min-[420px]:ml-auto min-[420px]:w-auto">
              {(note.collaborators || []).slice(0, 3).map((collaborator) => (
                <CollaboratorAvatar key={collaborator} email={collaborator} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 hidden flex-wrap items-center justify-between gap-1.5 transition-opacity duration-200 min-[360px]:gap-2 min-[600px]:flex min-[600px]:opacity-0 min-[600px]:group-hover:opacity-100">
        <div className="flex min-w-0 items-center gap-1.5 text-[#9aa0a6]">
          {note.noteType === "image" && <ImageIcon size={14} />}
          {note.noteType === "checklist" && (
            <span className="text-xs">
              {checklistItems.filter((item) => item.checked).length}/{checklistItems.length} checked
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onArchive(note);
            }}
            className="smooth-motion smooth-lift inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#202124]/35 hover:text-[#e8eaed]"
            title={note.trashedAt ? "Restore task" : note.archived ? "Unarchive task" : "Archive task"}
          >
            {note.trashedAt ? <Undo2 size={15} /> : <Archive size={15} />}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTrash(note);
            }}
            className="smooth-motion smooth-lift inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#202124]/35 hover:text-[#f28b82]"
            title={note.trashedAt ? "Delete forever" : "Delete task"}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NoteCard;
