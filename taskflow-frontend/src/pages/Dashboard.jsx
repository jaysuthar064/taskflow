import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Archive, Bell, Plus, StickyNote, Trash2 } from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import LoadingScreen from "../components/common/LoadingScreen";
import Seo from "../components/common/Seo";
import SettingsView from "../components/dashboard/SettingsView";
import LabelManagerModal from "../components/notes/LabelManagerModal";
import NoteCard from "../components/notes/NoteCard";
import NoteComposer from "../components/notes/NoteComposer";
import NoteEditorModal from "../components/notes/NoteEditorModal";
import Snackbar from "../components/notes/Snackbar";
import {
  createSearchFilters,
  getSectionHeading,
  getVisibleNotes,
  mergeUniqueStrings,
  normalizeChecklistItemsForDraft,
  readStoredLabels,
  SIDEBAR_SECTIONS,
  writeStoredLabels
} from "../components/notes/noteUtils";
import { AuthContext } from "../context/auth-context";
import { useAppInstallPrompt } from "../hooks/useAppInstallPrompt";
import { useMobileScheduledReminders } from "../hooks/useMobileScheduledReminders";
import { usePushNotifications } from "../hooks/usePushNotifications";

const EMPTY_FILTERS = createSearchFilters();

const getApiMessage = (error, fallback) => error.response?.data?.message || fallback;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const installSettings = useAppInstallPrompt();
  const notificationSettings = usePushNotifications();
  const searchInputRef = useRef(null);
  const undoActionRef = useRef(null);
  const undoTimeoutRef = useRef(null);
  const actionHandlersRef = useRef({
    handleArchiveNote: async () => {},
    handleTrashNote: async () => {},
    handleUndoSnackbar: async () => {}
  });
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("notes");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof localStorage === "undefined") {
      return "grid";
    }

    return localStorage.getItem("taskflow:notes-view") || "grid";
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [labelCatalog, setLabelCatalog] = useState([]);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState("");
  const [snackbar, setSnackbar] = useState({ message: "", undoable: false });
  const [composerLaunch, setComposerLaunch] = useState({ key: 0, type: "text" });

  const persistLabels = (nextLabels) => {
    setLabelCatalog(nextLabels);
    writeStoredLabels(user?._id, nextLabels);
  };

  useEffect(() => {
    setLabelCatalog(readStoredLabels(user?._id));
  }, [user?._id]);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("taskflow:notes-view", viewMode);
    }
  }, [viewMode]);

  const loadNotes = async ({ withLoader = false } = {}) => {
    if (withLoader) {
      setIsLoading(true);
    }

    try {
      const response = await API.get("/tasks?all=true");
      const nextNotes = response.data?.data ?? response.data?.tasks ?? [];
      setNotes(Array.isArray(nextNotes) ? nextNotes : []);
    } catch (error) {
      console.error("Unable to load tasks", error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes({ withLoader: true });
  }, []);

  useMobileScheduledReminders({
    tasks: notes,
    enabled: notificationSettings.permission === "granted"
  });

  const availableLabels = useMemo(
    () => mergeUniqueStrings(labelCatalog, ...notes.map((note) => note.labels || [])),
    [labelCatalog, notes]
  );

  const visibleNotes = useMemo(
    () =>
      getVisibleNotes(notes, {
        section: activeSection,
        selectedLabel,
        searchQuery,
        filters: searchFilters
      }),
    [activeSection, notes, searchFilters, searchQuery, selectedLabel]
  );

  const activeNote = useMemo(
    () => notes.find((note) => note._id === activeNoteId) || null,
    [activeNoteId, notes]
  );

  useEffect(() => {
    if (activeNoteId && !activeNote) {
      setActiveNoteId("");
    }
  }, [activeNote, activeNoteId]);

  const showUndoSnackbar = (message, undoHandler) => {
    if (undoTimeoutRef.current) {
      window.clearTimeout(undoTimeoutRef.current);
    }

    undoActionRef.current = undoHandler;
    setSnackbar({
      message,
      undoable: typeof undoHandler === "function"
    });

    undoTimeoutRef.current = window.setTimeout(() => {
      undoActionRef.current = null;
      setSnackbar({ message: "", undoable: false });
    }, 5000);
  };

  const dismissSnackbar = () => {
    if (undoTimeoutRef.current) {
      window.clearTimeout(undoTimeoutRef.current);
    }

    undoActionRef.current = null;
    setSnackbar({ message: "", undoable: false });
  };

  const handleUndoSnackbar = async () => {
    if (undoActionRef.current) {
      await undoActionRef.current();
    }

    dismissSnackbar();
  };

  const createNoteRecord = async (payload) => {
    try {
      const response = await API.post("/tasks", payload);
      const createdNote = response.data?.data ?? null;

      if (!createdNote?._id) {
        throw new Error("Unable to create this task.");
      }

      setNotes((currentNotes) => [createdNote, ...currentNotes]);
      if (createdNote.labels?.length) {
        persistLabels(mergeUniqueStrings(labelCatalog, createdNote.labels));
      }
      setSelectedLabel("");
      setActiveSection("notes");
      return createdNote;
    } catch (error) {
      throw new Error(getApiMessage(error, "Unable to create this task."));
    }
  };

  const updateNoteRecord = async (noteId, updates) => {
    try {
      const response = await API.patch(`/tasks/${noteId}`, updates);
      const updatedNote = response.data?.data ?? response.data?.task ?? null;

      if (!updatedNote?._id) {
        throw new Error("Unable to update this task.");
      }

      setNotes((currentNotes) =>
        currentNotes.map((note) => (note._id === updatedNote._id ? updatedNote : note))
      );

      if (updatedNote.labels?.length) {
        persistLabels(mergeUniqueStrings(labelCatalog, updatedNote.labels));
      }

      return updatedNote;
    } catch (error) {
      throw new Error(getApiMessage(error, "Unable to update this task."));
    }
  };

  const deleteNoteRecord = async (noteId) => {
    try {
      await API.delete(`/tasks/${noteId}`);
      setNotes((currentNotes) => currentNotes.filter((note) => note._id !== noteId));
    } catch (error) {
      throw new Error(getApiMessage(error, "Unable to permanently delete this task."));
    }
  };

  const ensureLabelExists = async (label) => {
    const cleanLabel = String(label || "").trim().replace(/^#/, "");

    if (!cleanLabel) {
      return;
    }

    persistLabels(mergeUniqueStrings(labelCatalog, cleanLabel));
  };

  const handleArchiveNote = async (note) => {
    const updatedNote = await updateNoteRecord(note._id, {
      archived: !note.archived,
      trashedAt: null
    });

    if (!note.archived) {
      showUndoSnackbar("Task archived", async () => {
        await updateNoteRecord(note._id, {
          archived: false
        });
      });
    } else {
      dismissSnackbar();
    }

    return updatedNote;
  };

  const handleTrashNote = async (note) => {
    const trashedAt = new Date().toISOString();
    await updateNoteRecord(note._id, {
      trashedAt,
      archived: false,
      pinned: false
    });

    showUndoSnackbar("Task moved to trash", async () => {
      await updateNoteRecord(note._id, {
        trashedAt: null
      });
    });
  };

  actionHandlersRef.current = {
    handleArchiveNote,
    handleTrashNote,
    handleUndoSnackbar
  };

  const handleRestoreNote = async (note) => {
    await updateNoteRecord(note._id, {
      trashedAt: null
    });
  };

  const handleDeleteForever = async (note) => {
    const confirmed = window.confirm("Delete this task forever?");

    if (!confirmed) {
      return;
    }

    await deleteNoteRecord(note._id);
  };

  const handleEmptyTrash = async () => {
    const trashNotes = notes.filter((note) => Boolean(note.trashedAt));

    if (trashNotes.length === 0) {
      return;
    }

    const confirmed = window.confirm(`Delete ${trashNotes.length} task${trashNotes.length === 1 ? "" : "s"} forever?`);

    if (!confirmed) {
      return;
    }

    await Promise.all(trashNotes.map((note) => API.delete(`/tasks/${note._id}`)));
    setNotes((currentNotes) => currentNotes.filter((note) => !note.trashedAt));
    dismissSnackbar();
  };

  const handleTogglePin = async (note) => {
    await updateNoteRecord(note._id, {
      pinned: !note.pinned
    });
  };

  const handleToggleChecklistItem = async (note, itemId) => {
    const nextChecklistItems = normalizeChecklistItemsForDraft(note.checklistItems || []).map((item) =>
      item.itemId === itemId ? { ...item, checked: !item.checked } : item
    );

    await updateNoteRecord(note._id, {
      checklistItems: nextChecklistItems
    });
  };

  const handleCreateLabel = async (rawLabel) => {
    const cleanLabel = String(rawLabel || "").trim().replace(/^#/, "");

    if (!cleanLabel) {
      return;
    }

    persistLabels(mergeUniqueStrings(labelCatalog, cleanLabel));
  };

  const handleRenameLabel = async (previousLabel, nextLabel) => {
    const cleanNextLabel = String(nextLabel || "").trim().replace(/^#/, "");

    if (!cleanNextLabel || cleanNextLabel.toLowerCase() === previousLabel.toLowerCase()) {
      return;
    }

    persistLabels(
      mergeUniqueStrings(
        labelCatalog.map((label) =>
          label.toLowerCase() === previousLabel.toLowerCase() ? cleanNextLabel : label
        )
      )
    );

    const notesWithLabel = notes.filter((note) =>
      (note.labels || []).some((label) => label.toLowerCase() === previousLabel.toLowerCase())
    );

    await Promise.all(
      notesWithLabel.map((note) =>
        updateNoteRecord(note._id, {
          labels: (note.labels || []).map((label) =>
            label.toLowerCase() === previousLabel.toLowerCase() ? cleanNextLabel : label
          )
        })
      )
    );

    if (selectedLabel.toLowerCase() === previousLabel.toLowerCase()) {
      setSelectedLabel(cleanNextLabel);
    }
  };

  const handleDeleteLabel = async (labelToDelete) => {
    const confirmed = window.confirm(`Delete label #${labelToDelete} from every task?`);

    if (!confirmed) {
      return;
    }

    persistLabels(labelCatalog.filter((label) => label.toLowerCase() !== labelToDelete.toLowerCase()));

    const notesWithLabel = notes.filter((note) =>
      (note.labels || []).some((label) => label.toLowerCase() === labelToDelete.toLowerCase())
    );

    await Promise.all(
      notesWithLabel.map((note) =>
        updateNoteRecord(note._id, {
          labels: (note.labels || []).filter((label) => label.toLowerCase() !== labelToDelete.toLowerCase())
        })
      )
    );

    if (selectedLabel.toLowerCase() === labelToDelete.toLowerCase()) {
      setSelectedLabel("");
    }
  };

  const launchComposer = (type = "text") => {
    setActiveSection("notes");
    setComposerLaunch({
      key: Date.now(),
      type
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleKeyboardShortcuts = (event) => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "SELECT" ||
        activeElement?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        actionHandlersRef.current.handleUndoSnackbar();
        return;
      }

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === "Escape") {
        if (activeNoteId) {
          setActiveNoteId("");
          return;
        }

        if (searchQuery || Object.values(searchFilters).some((value) => Array.isArray(value) ? value.length > 0 : value)) {
          setSearchQuery("");
          setSearchFilters(createSearchFilters());
        }
        return;
      }

      if (isTyping) {
        return;
      }

      const lowerKey = event.key.toLowerCase();

      if (lowerKey === "c") {
        event.preventDefault();
        launchComposer("text");
        return;
      }

      if (lowerKey === "l") {
        event.preventDefault();
        launchComposer("checklist");
        return;
      }

      const visibleNoteIds = visibleNotes.map((note) => note._id);
      const currentIndex = visibleNoteIds.indexOf(activeNoteId);

      if (lowerKey === "j" && visibleNoteIds.length > 0) {
        event.preventDefault();
        const nextIndex = currentIndex >= 0 && currentIndex < visibleNoteIds.length - 1 ? currentIndex + 1 : 0;
        setActiveNoteId(visibleNoteIds[nextIndex]);
        return;
      }

      if (lowerKey === "k" && visibleNoteIds.length > 0) {
        event.preventDefault();
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : visibleNoteIds.length - 1;
        setActiveNoteId(visibleNoteIds[nextIndex]);
        return;
      }

      const selectedNote = notes.find((note) => note._id === activeNoteId);

      if (!selectedNote) {
        return;
      }

      if (lowerKey === "e") {
        event.preventDefault();
        actionHandlersRef.current.handleArchiveNote(selectedNote).catch(() => {});
      }

      if (event.key === "#") {
        event.preventDefault();
        actionHandlersRef.current.handleTrashNote(selectedNote).catch(() => {});
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [activeNoteId, notes, searchFilters, searchQuery, visibleNotes]);

  const pinnedNotes = activeSection === "notes"
    ? visibleNotes.filter((note) => note.pinned)
    : [];
  const otherNotes = activeSection === "notes"
    ? visibleNotes.filter((note) => !note.pinned)
    : visibleNotes;
  const sectionHeading = getSectionHeading(activeSection);

  const renderNoteCollection = (noteCollection) => {
    if (noteCollection.length === 0) {
      return (
        <div className="rounded-[1.5rem] border border-dashed border-[#5f6368] bg-[#303134] px-6 py-12 text-center text-[#9aa0a6]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">No tasks here</p>
          <p className="mt-3 text-sm">
            {activeSection === "trash"
              ? "Trashed tasks will appear here until they are deleted forever."
              : "Create a task or adjust your filters to see more results."}
          </p>
        </div>
      );
    }

    if (viewMode === "list") {
      return (
        <div className="space-y-4">
          {noteCollection.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              viewMode="list"
              searchQuery={searchQuery}
              isSelected={activeNoteId === note._id}
              onSelect={setActiveNoteId}
              onOpen={(selectedNote) => setActiveNoteId(selectedNote._id)}
              onToggleChecklistItem={note.trashedAt ? null : handleToggleChecklistItem}
              onTogglePin={handleTogglePin}
              onArchive={note.trashedAt ? handleRestoreNote : handleArchiveNote}
              onTrash={note.trashedAt ? handleDeleteForever : handleTrashNote}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="relative isolate grid grid-cols-1 items-start gap-5 overflow-visible px-0.5 min-[480px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
        {noteCollection.map((note) => (
          <div key={note._id} className="relative isolate h-fit min-w-0 hover:z-30 focus-within:z-30">
            <NoteCard
              note={note}
              viewMode="grid"
              searchQuery={searchQuery}
              isSelected={activeNoteId === note._id}
              onSelect={setActiveNoteId}
              onOpen={(selectedNote) => setActiveNoteId(selectedNote._id)}
              onToggleChecklistItem={note.trashedAt ? null : handleToggleChecklistItem}
              onTogglePin={handleTogglePin}
              onArchive={note.trashedAt ? handleRestoreNote : handleArchiveNote}
              onTrash={note.trashedAt ? handleDeleteForever : handleTrashNote}
            />
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#202124] min-[900px]:flex" style={{ fontFamily: "'Roboto', system-ui, sans-serif" }}>
      <Seo
        title="Dashboard | TaskFlow"
        description="Track tasks, reminders, checklists, attachments, and priorities in TaskFlow."
        path="/dashboard"
        robots="noindex,nofollow"
      />

      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
        labels={availableLabels}
        selectedLabel={selectedLabel}
        onSelectLabel={setSelectedLabel}
        onOpenLabelManager={() => setIsLabelManagerOpen(true)}
        onCreateNote={() => launchComposer("text")}
      />

      <div className="relative min-w-0 flex-1">
        <Navbar
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 900) {
              setIsMobileSidebarOpen((current) => !current);
            } else {
              setIsSidebarCollapsed((current) => !current);
            }
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenSettings={() => {
            setSelectedLabel("");
            setActiveSection("settings");
          }}
          searchInputRef={searchInputRef}
        />

        <main className="mx-auto max-w-[1400px] px-3 pb-28 pt-4 min-[360px]:pt-5 sm:px-4 min-[900px]:px-6 min-[900px]:pt-6">
          {activeSection === "settings" ? (
            <SettingsView
              notificationSettings={notificationSettings}
              installSettings={installSettings}
            />
          ) : (
            <div className="space-y-6">
              <section className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">
                    {selectedLabel ? `Label / #${selectedLabel}` : SIDEBAR_SECTIONS.find((section) => section.id === activeSection)?.label || "TaskFlow"}
                  </p>
                  <h1 className="text-2xl font-medium text-[#e8eaed] min-[360px]:text-[2rem]">{sectionHeading.title}</h1>
                  <p className="max-w-2xl text-sm leading-6 text-[#9aa0a6]">{sectionHeading.description}</p>
                </div>

                {activeSection === "trash" && (
                  <button
                    type="button"
                    onClick={handleEmptyTrash}
                    className="inline-flex items-center justify-center rounded-full border border-[#8c3c3c] px-4 py-2 text-sm font-medium text-[#f28b82] transition-colors hover:bg-[#47292b]"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Empty Trash
                  </button>
                )}
              </section>

              {activeSection === "notes" && (
                <NoteComposer
                  key={composerLaunch.key || "composer"}
                  initialMode={composerLaunch.type}
                  autoExpand={Boolean(composerLaunch.key)}
                  onCreateNote={createNoteRecord}
                  availableLabels={availableLabels}
                  onEnsureLabel={ensureLabelExists}
                />
              )}

              {activeSection === "notes" && pinnedNotes.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <PinlessLabel icon={<StickyNote size={16} />} label="PINNED" />
                  </div>
                  {renderNoteCollection(pinnedNotes)}
                </section>
              )}

              <section className="space-y-4">
                {activeSection === "notes" && otherNotes.length > 0 && pinnedNotes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <PinlessLabel icon={<StickyNote size={16} />} label="OTHERS" />
                  </div>
                )}
                {activeSection === "reminders" && (
                  <div className="flex items-center gap-3">
                    <PinlessLabel icon={<Bell size={16} />} label="UPCOMING" />
                  </div>
                )}
                {activeSection === "archive" && (
                  <div className="flex items-center gap-3">
                    <PinlessLabel icon={<Archive size={16} />} label="ARCHIVED" />
                  </div>
                )}
                {activeSection === "trash" && (
                  <div className="flex items-center gap-3">
                    <PinlessLabel icon={<Trash2 size={16} />} label="TRASH" />
                  </div>
                )}
                {renderNoteCollection(otherNotes)}
              </section>
            </div>
          )}
        </main>
      </div>

      {activeSection !== "settings" && (
        <MobileCreateButton onCreateNote={() => launchComposer("text")} />
      )}

      <LabelManagerModal
        key={availableLabels.join("|")}
        isOpen={isLabelManagerOpen}
        labels={availableLabels}
        onClose={() => setIsLabelManagerOpen(false)}
        onCreateLabel={handleCreateLabel}
        onRenameLabel={handleRenameLabel}
        onDeleteLabel={handleDeleteLabel}
      />

      {activeNote && (
        <NoteEditorModal
          key={activeNote._id}
          note={activeNote}
          searchQuery={searchQuery}
          availableLabels={availableLabels}
          onEnsureLabel={ensureLabelExists}
          onUpdateNote={updateNoteRecord}
          onTogglePin={handleTogglePin}
          onArchive={handleArchiveNote}
          onTrash={handleTrashNote}
          onRestore={handleRestoreNote}
          onDeleteForever={() => handleDeleteForever(activeNote)}
          onClose={() => setActiveNoteId("")}
        />
      )}

      <Snackbar
        snackbar={snackbar}
        onUndo={handleUndoSnackbar}
        onDismiss={dismissSnackbar}
      />
    </div>
  );
};

const PinlessLabel = ({ icon, label }) => (
  <div className="inline-flex items-center rounded-full border border-white/10 bg-[#303134] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9aa0a6] min-[360px]:text-[11px] min-[360px]:tracking-[0.24em]">
    <span className="mr-2 text-[#8ab4f8]">{icon}</span>
    {label}
  </div>
);

const MobileCreateButton = ({ onCreateNote }) => (
  <button
    type="button"
    onClick={onCreateNote}
    className="fixed bottom-5 right-4 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#feefc3] text-[#202124] shadow-[0_16px_32px_rgba(0,0,0,0.28)] transition-transform hover:scale-[1.03] max-[599px]:flex min-[600px]:hidden"
    title="Create task"
    aria-label="Create task"
  >
    <Plus size={24} />
  </button>
);

export default Dashboard;
