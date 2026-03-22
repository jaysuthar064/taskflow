import React from "react";

const Snackbar = ({ snackbar, onUndo, onDismiss }) => {
  if (!snackbar?.message) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[140] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 duration-200 sm:bottom-6 sm:left-6">
      <div className="flex items-center gap-4 rounded-[1.25rem] border border-[#5f6368] bg-[#202124] px-4 py-3 text-sm text-[#e8eaed] shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
        <span>{snackbar.message}</span>
        {snackbar.undoable && (
          <button
            type="button"
            onClick={onUndo}
            className="text-sm font-semibold text-[#8ab4f8] transition-colors hover:text-white"
          >
            Undo
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-[#9aa0a6] transition-colors hover:text-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
