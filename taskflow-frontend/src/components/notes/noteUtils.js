import {
  REMINDER_REPEAT_VALUES,
  formatReminderRepeat,
  formatReminderTime
} from "../tasks/taskReminderUtils.js";

export const NOTE_COLORS = [
  { value: "default", label: "Default", fill: "#303134", border: "#5f6368", text: "#e8eaed" },
  { value: "coral", label: "Coral", fill: "#77172e", border: "#a5385a", text: "#ffe8ef" },
  { value: "peach", label: "Peach", fill: "#692b17", border: "#a64b24", text: "#ffe9de" },
  { value: "sand", label: "Sand", fill: "#7c4a03", border: "#b67519", text: "#fff0d8" },
  { value: "mint", label: "Mint", fill: "#0c625d", border: "#1e9087", text: "#dffcf6" },
  { value: "sage", label: "Sage", fill: "#2d555e", border: "#537c86", text: "#ecf9ff" },
  { value: "fog", label: "Fog", fill: "#256377", border: "#3c8da7", text: "#e4f7ff" },
  { value: "storm", label: "Storm", fill: "#284255", border: "#4b6b84", text: "#e9f2ff" },
  { value: "dusk", label: "Dusk", fill: "#472e5b", border: "#745090", text: "#f3e8ff" },
  { value: "blossom", label: "Blossom", fill: "#6c394f", border: "#a55b7b", text: "#ffe6f1" },
  { value: "clay", label: "Clay", fill: "#4b443a", border: "#7a7164", text: "#f7f1e8" },
  { value: "chalk", label: "Chalk", fill: "#232427", border: "#4c4f54", text: "#f2f4f7" }
];

export const NOTE_BACKGROUNDS = [
  {
    value: "none",
    label: "Plain",
    preview: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    overlay: ""
  },
  {
    value: "groceries",
    label: "Groceries",
    preview: "radial-gradient(circle at 25% 25%, rgba(138,180,248,0.25), transparent 38%), radial-gradient(circle at 70% 75%, rgba(95,99,104,0.28), transparent 32%)",
    overlay: "linear-gradient(135deg, rgba(138,180,248,0.08), rgba(0,0,0,0))"
  },
  {
    value: "food",
    label: "Food",
    preview: "radial-gradient(circle at 20% 20%, rgba(255,183,77,0.35), transparent 30%), radial-gradient(circle at 80% 30%, rgba(255,112,67,0.2), transparent 35%)",
    overlay: "linear-gradient(135deg, rgba(255,183,77,0.08), rgba(0,0,0,0))"
  },
  {
    value: "music",
    label: "Music",
    preview: "radial-gradient(circle at 30% 30%, rgba(186,104,200,0.24), transparent 28%), radial-gradient(circle at 70% 70%, rgba(92,107,192,0.22), transparent 30%)",
    overlay: "linear-gradient(140deg, rgba(179,136,255,0.08), rgba(0,0,0,0))"
  },
  {
    value: "recipes",
    label: "Recipes",
    preview: "linear-gradient(135deg, rgba(255,241,118,0.16), transparent 40%), radial-gradient(circle at 72% 26%, rgba(102,187,106,0.2), transparent 28%)",
    overlay: "linear-gradient(140deg, rgba(255,241,118,0.07), rgba(0,0,0,0))"
  },
  {
    value: "notes",
    label: "Lines",
    preview: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 0%), repeating-linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 1px, transparent 1px, transparent 28px)",
    overlay: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0))"
  },
  {
    value: "travel",
    label: "Travel",
    preview: "radial-gradient(circle at 20% 20%, rgba(79,195,247,0.25), transparent 30%), radial-gradient(circle at 78% 78%, rgba(255,213,79,0.24), transparent 26%)",
    overlay: "linear-gradient(145deg, rgba(79,195,247,0.06), rgba(255,213,79,0.04))"
  }
];

export const SEARCH_FILTER_DEFINITIONS = [
  { key: "reminders", label: "Reminders" },
  { key: "lists", label: "Lists" },
  { key: "images", label: "Images" },
  { key: "urls", label: "URLs" },
  { key: "drawings", label: "Drawings" }
];

export const SIDEBAR_SECTIONS = [
  { id: "notes", label: "Tasks" },
  { id: "reminders", label: "Reminders" },
  { id: "archive", label: "Archive" },
  { id: "trash", label: "Trash" }
];

export const createSearchFilters = () => ({
  reminders: false,
  lists: false,
  images: false,
  urls: false,
  drawings: false,
  colors: []
});

export const createClientId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createChecklistItem = (overrides = {}) => ({
  itemId: createClientId(),
  text: "",
  checked: false,
  order: 0,
  ...overrides
});

export const buildEmptyNoteDraft = (noteType = "text") => ({
  title: "",
  description: "",
  noteType,
  checklistItems: noteType === "checklist" ? [createChecklistItem()] : [],
  pinned: false,
  archived: false,
  trashedAt: null,
  color: "default",
  background: "none",
  labels: [],
  collaborators: [],
  imageData: "",
  reminder: null,
  reminderRepeat: REMINDER_REPEAT_VALUES.ONCE,
  reminderWeekdays: [],
  reminderPlace: "",
  completed: false
});

export const normalizeChecklistItemsForDraft = (checklistItems = []) =>
  (Array.isArray(checklistItems) ? checklistItems : [])
    .map((item, index) => ({
      itemId: item.itemId || item.id || createClientId(),
      text: String(item.text || ""),
      checked: Boolean(item.checked),
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : index
    }))
    .sort((firstItem, secondItem) => firstItem.order - secondItem.order)
    .map((item, index) => ({
      ...item,
      order: index
    }));

export const noteToDraft = (note) => ({
  title: note?.title || "",
  description: note?.description || "",
  noteType: note?.noteType || "text",
  checklistItems: normalizeChecklistItemsForDraft(note?.checklistItems || []),
  pinned: Boolean(note?.pinned),
  archived: Boolean(note?.archived),
  trashedAt: note?.trashedAt || null,
  color: note?.color || "default",
  background: note?.background || "none",
  labels: Array.isArray(note?.labels) ? note.labels : [],
  collaborators: Array.isArray(note?.collaborators) ? note.collaborators : [],
  imageData: note?.imageData || "",
  reminder: note?.reminder || null,
  reminderRepeat: note?.reminderRepeat || REMINDER_REPEAT_VALUES.ONCE,
  reminderWeekdays: Array.isArray(note?.reminderWeekdays) ? note.reminderWeekdays : [],
  reminderPlace: note?.reminderPlace || "",
  completed: Boolean(note?.completed)
});

export const extractHashtagLabels = (...values) => {
  const labels = [];
  const seen = new Set();

  values.forEach((value) => {
    const matches = String(value || "").matchAll(/#([a-z0-9][a-z0-9-_]{0,39})/gi);

    for (const match of matches) {
      const label = String(match[1] || "").trim();

      if (!label) {
        continue;
      }

      const key = label.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        labels.push(label);
      }
    }
  });

  return labels;
};

export const mergeUniqueStrings = (...groups) => {
  const nextValues = [];
  const seen = new Set();

  groups.flat().forEach((value) => {
    const cleanValue = String(value || "").trim();

    if (!cleanValue) {
      return;
    }

    const key = cleanValue.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      nextValues.push(cleanValue);
    }
  });

  return nextValues;
};

export const getNoteTitle = (note) => {
  if (note?.title?.trim()) {
    return note.title.trim();
  }

  if (note?.noteType === "checklist") {
    const firstItem = note.checklistItems?.find((item) => item.text?.trim());
    return firstItem?.text?.trim() || "Untitled checklist";
  }

  if (note?.noteType === "image") {
    return "Image task";
  }

  if (note?.noteType === "drawing") {
    return "Sketch task";
  }

  return "Untitled task";
};

export const getNoteBodyPreview = (note) => {
  if (note?.noteType === "checklist") {
    return normalizeChecklistItemsForDraft(note.checklistItems)
      .slice(0, 4)
      .map((item) => item.text)
      .filter(Boolean)
      .join(" | ");
  }

  return String(note?.description || "").trim();
};

export const noteHasUrl = (note) => /https?:\/\/|www\./i.test(`${note?.title || ""} ${note?.description || ""}`);

export const noteMatchesSearch = (note, searchQuery) => {
  const query = String(searchQuery || "").trim().toLowerCase();

  if (!query) {
    return true;
  }

  const haystack = [
    note?.title,
    note?.description,
    ...(note?.labels || []),
    ...(note?.collaborators || []),
    ...(note?.checklistItems || []).map((item) => item.text)
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

export const noteMatchesFilters = (note, filters) => {
  if (filters.reminders && !note?.reminder && !note?.reminderPlace) {
    return false;
  }

  if (filters.lists && note?.noteType !== "checklist") {
    return false;
  }

  if (filters.images && !note?.imageData && note?.noteType !== "image") {
    return false;
  }

  if (filters.urls && !noteHasUrl(note)) {
    return false;
  }

  if (filters.drawings && note?.noteType !== "drawing") {
    return false;
  }

  if (filters.colors.length > 0 && !filters.colors.includes(note?.color || "default")) {
    return false;
  }

  return true;
};

export const getNoteReminderText = (note) => {
  const parts = [];
  const reminderLabel = formatReminderTime(note?.reminder);
  const repeatLabel = formatReminderRepeat(note?.reminderRepeat, note?.reminderWeekdays);

  if (reminderLabel) {
    parts.push(reminderLabel);
  }

  if (repeatLabel) {
    parts.push(repeatLabel);
  }

  if (note?.reminderPlace) {
    parts.push(note.reminderPlace);
  }

  return parts.join(" | ");
};

export const getNoteVisuals = (note) => {
  const color = NOTE_COLORS.find((option) => option.value === (note?.color || "default")) || NOTE_COLORS[0];
  const background = NOTE_BACKGROUNDS.find((option) => option.value === (note?.background || "none")) || NOTE_BACKGROUNDS[0];

  return {
    color,
    background,
    cardStyle: {
      backgroundColor: color.fill,
      color: color.text,
      borderColor: color.border,
      backgroundImage: background.overlay
        ? `${background.overlay}, ${background.preview}`
        : background.preview,
      backgroundBlendMode: "screen, normal"
    }
  };
};

export const getVisibleNotes = (notes, { section = "notes", selectedLabel = "", searchQuery = "", filters = createSearchFilters() }) => {
  const safeNotes = Array.isArray(notes) ? notes : [];

  return safeNotes
    .filter((note) => {
      if (section === "trash") {
        return Boolean(note?.trashedAt);
      }

      if (note?.trashedAt) {
        return false;
      }

      if (section === "archive") {
        return Boolean(note?.archived);
      }

      if (section === "reminders") {
        return !note?.archived && Boolean(note?.reminder || note?.reminderPlace);
      }

      return !note?.archived;
    })
    .filter((note) => !selectedLabel || (note?.labels || []).some((label) => label.toLowerCase() === selectedLabel.toLowerCase()))
    .filter((note) => noteMatchesSearch(note, searchQuery))
    .filter((note) => noteMatchesFilters(note, filters))
    .sort((firstNote, secondNote) => {
      if (section !== "trash" && firstNote.pinned !== secondNote.pinned) {
        return Number(secondNote.pinned) - Number(firstNote.pinned);
      }

      if (section === "reminders") {
        const firstReminder = new Date(firstNote.reminder || firstNote.updatedAt || 0).getTime();
        const secondReminder = new Date(secondNote.reminder || secondNote.updatedAt || 0).getTime();
        return firstReminder - secondReminder;
      }

      const firstUpdatedAt = new Date(firstNote.updatedAt || firstNote.createdAt || 0).getTime();
      const secondUpdatedAt = new Date(secondNote.updatedAt || secondNote.createdAt || 0).getTime();
      return secondUpdatedAt - firstUpdatedAt;
    });
};

export const splitHighlightedText = (text, query) => {
  const source = String(text || "");
  const search = String(query || "").trim();

  if (!search) {
    return [{ value: source, highlight: false }];
  }

  const escapedQuery = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escapedQuery})`, "ig");
  const segments = source.split(pattern);

  return segments
    .filter(Boolean)
    .map((segment) => ({
      value: segment,
      highlight: segment.toLowerCase() === search.toLowerCase()
    }));
};

export const getLabelStorageKey = (userId) => `taskflow:note-labels:${userId || "anonymous"}`;

export const readStoredLabels = (userId) => {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const rawValue = localStorage.getItem(getLabelStorageKey(userId));
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

export const writeStoredLabels = (userId, labels) => {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(getLabelStorageKey(userId), JSON.stringify(labels));
  } catch {
    // Ignore storage write failures and keep the UI responsive.
  }
};

export const sanitizeDraftForSave = (draft) => {
  const checklistItems = normalizeChecklistItemsForDraft(draft.checklistItems || []);
  const noteType = draft.noteType === "checklist" && checklistItems.length === 0
    ? "text"
    : draft.noteType || "text";
  const labels = mergeUniqueStrings(
    Array.isArray(draft.labels) ? draft.labels : [],
    extractHashtagLabels(draft.title, draft.description, ...checklistItems.map((item) => item.text))
  );
  const collaborators = mergeUniqueStrings(Array.isArray(draft.collaborators) ? draft.collaborators : []);

  return {
    title: String(draft.title || "").trim(),
    description: String(draft.description || "").trim(),
    noteType,
    checklistItems,
    pinned: Boolean(draft.pinned),
    archived: Boolean(draft.archived),
    trashedAt: draft.trashedAt || null,
    color: draft.color || "default",
    background: draft.background || "none",
    labels,
    collaborators,
    imageData: String(draft.imageData || ""),
    reminder: draft.reminder || null,
    reminderRepeat: draft.reminderRepeat || REMINDER_REPEAT_VALUES.ONCE,
    reminderWeekdays: Array.isArray(draft.reminderWeekdays) ? draft.reminderWeekdays : [],
    reminderPlace: String(draft.reminderPlace || "").trim(),
    completed: noteType === "checklist" && checklistItems.length > 0
      ? checklistItems.every((item) => item.checked)
      : Boolean(draft.completed)
  };
};

export const draftHasMeaningfulContent = (draft) => {
  const cleanDraft = sanitizeDraftForSave(draft);

  return Boolean(
    cleanDraft.title ||
    cleanDraft.description ||
    cleanDraft.imageData ||
    cleanDraft.noteType === "drawing" ||
    cleanDraft.checklistItems.some((item) => item.text)
  );
};

export const getSectionHeading = (section) => {
  switch (section) {
    case "reminders":
      return {
        title: "Reminders",
        description: "See every task with a time or place reminder."
      };
    case "archive":
      return {
        title: "Archive",
        description: "Archived tasks stay here until you bring them back."
      };
    case "trash":
      return {
        title: "Trash",
        description: "Items in trash are removed forever after 7 days."
      };
    default:
      return {
        title: "Tasks",
        description: "Track tasks, checklists, attachments, and reminders in one place."
      };
  }
};
