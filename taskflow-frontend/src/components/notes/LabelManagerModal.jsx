import React, { useState } from "react";
import { PencilLine, Plus, Tag, Trash2, X } from "lucide-react";

const LabelManagerModal = ({
  isOpen,
  labels = [],
  onClose,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel
}) => {
  const [drafts, setDrafts] = useState(() => Object.fromEntries(labels.map((label) => [label, label])));
  const [newLabel, setNewLabel] = useState("");

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-[1.75rem] border border-[#5f6368] bg-[#202124] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">Labels</p>
            <h3 className="mt-1 text-xl font-medium text-[#e8eaed]">Edit labels</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#303134] hover:text-[#e8eaed]"
            title="Close labels"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-full border border-[#5f6368] bg-[#303134] px-3">
              <Tag size={16} className="mr-2 text-[#9aa0a6]" />
              <input
                type="text"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onCreateLabel(newLabel);
                    setNewLabel("");
                  }
                }}
                placeholder="Create a label"
                className="w-full bg-transparent py-2.5 text-sm text-[#e8eaed] outline-none placeholder:text-[#9aa0a6]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onCreateLabel(newLabel);
                setNewLabel("");
              }}
              className="inline-flex items-center justify-center rounded-full bg-[#8ab4f8] px-4 py-2 text-sm font-semibold text-[#202124]"
            >
              <Plus size={16} className="mr-2" />
              Add
            </button>
          </div>

          <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            {labels.length === 0 && (
              <div className="rounded-[1.25rem] border border-dashed border-[#5f6368] px-4 py-6 text-center text-sm text-[#9aa0a6]">
                Create labels to organize tasks from the sidebar and task toolbar.
              </div>
            )}

            {labels.map((label) => (
              <div key={label} className="flex items-center gap-2 rounded-[1.25rem] border border-[#3c4043] bg-[#303134] px-3 py-2.5">
                <Tag size={15} className="text-[#9aa0a6]" />
                <input
                  type="text"
                  value={drafts[label] || ""}
                  onChange={(event) =>
                    setDrafts((currentDrafts) => ({
                      ...currentDrafts,
                      [label]: event.target.value
                    }))
                  }
                  className="flex-1 bg-transparent text-sm text-[#e8eaed] outline-none"
                />
                <button
                  type="button"
                  onClick={() => onRenameLabel(label, drafts[label])}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#202124] hover:text-[#8ab4f8]"
                  title="Rename label"
                >
                  <PencilLine size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteLabel(label)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#202124] hover:text-[#f28b82]"
                  title="Delete label"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelManagerModal;
