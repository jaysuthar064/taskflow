import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Task, {
    NOTE_BACKGROUND_OPTIONS,
    NOTE_COLOR_OPTIONS,
    NOTE_TYPE_OPTIONS
} from "../models/taskModel.js";
import { REMINDER_REPEAT_OPTIONS, REMINDER_REPEAT_VALUES } from "../utils/reminderSchedule.js";

const TASK_TITLE_MAX_LENGTH = 120;
const TASK_DESCRIPTION_MAX_LENGTH = 4000;
const CHECKLIST_ITEM_TEXT_MAX_LENGTH = 280;
const LABEL_MAX_LENGTH = 40;
const COLLABORATOR_MAX_LENGTH = 120;
const REMINDER_WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6];
const REMINDER_PLACE_MAX_LENGTH = 120;
const IMAGE_DATA_MAX_LENGTH = 2_500_000;
const TRASH_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const createBadRequestError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const toTrimmedString = (value) => String(value ?? "").trim();

const normalizeTitle = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const title = toTrimmedString(value);

    if (title.length > TASK_TITLE_MAX_LENGTH) {
        throw createBadRequestError(`Note title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.`);
    }

    return title;
};

const normalizeDescription = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const description = toTrimmedString(value);

    if (description.length > TASK_DESCRIPTION_MAX_LENGTH) {
        throw createBadRequestError(`Note body must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.`);
    }

    return description;
};

const normalizeBoolean = (value, fieldLabel) => {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== "boolean") {
        throw createBadRequestError(`${fieldLabel} must be true or false.`);
    }

    return value;
};

const normalizeReminder = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return null;
    }

    const reminderDate = new Date(value);

    if (Number.isNaN(reminderDate.getTime())) {
        throw createBadRequestError("Reminder date is invalid.");
    }

    return reminderDate;
};

const normalizeReminderRepeat = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const normalizedValue = String(value || "").trim().toLowerCase() || REMINDER_REPEAT_VALUES.ONCE;

    if (!REMINDER_REPEAT_OPTIONS.includes(normalizedValue)) {
        throw createBadRequestError("Reminder repeat must be once, daily, or weekly.");
    }

    return normalizedValue;
};

const normalizeReminderWeekdays = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return [];
    }

    if (!Array.isArray(value)) {
        throw createBadRequestError("Reminder days must be provided as a list.");
    }

    const normalizedWeekdays = [...new Set(value.map((dayValue) => Number(dayValue)))]
        .sort((firstDay, secondDay) => firstDay - secondDay);

    if (
        normalizedWeekdays.some(
            (dayValue) => !Number.isInteger(dayValue) || !REMINDER_WEEKDAY_VALUES.includes(dayValue)
        )
    ) {
        throw createBadRequestError("Reminder days must use values between 0 and 6.");
    }

    return normalizedWeekdays;
};

const normalizeReminderPlace = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const place = toTrimmedString(value);

    if (place.length > REMINDER_PLACE_MAX_LENGTH) {
        throw createBadRequestError(`Reminder place must be ${REMINDER_PLACE_MAX_LENGTH} characters or fewer.`);
    }

    return place;
};

const normalizeReminderSettings = ({
    reminder,
    reminderRepeat = REMINDER_REPEAT_VALUES.ONCE,
    reminderWeekdays = [],
    reminderPlace = ""
}) => {
    if (!reminder) {
        return {
            reminder: null,
            reminderRepeat: REMINDER_REPEAT_VALUES.ONCE,
            reminderWeekdays: [],
            reminderPlace
        };
    }

    if (reminderRepeat === REMINDER_REPEAT_VALUES.WEEKLY && reminderWeekdays.length === 0) {
        throw createBadRequestError("Select at least one day for a weekly reminder.");
    }

    return {
        reminder,
        reminderRepeat,
        reminderWeekdays: reminderRepeat === REMINDER_REPEAT_VALUES.WEEKLY ? reminderWeekdays : [],
        reminderPlace
    };
};

const areSameReminderDates = (firstValue, secondValue) => {
    if (!firstValue && !secondValue) {
        return true;
    }

    if (!firstValue || !secondValue) {
        return false;
    }

    const firstDate = new Date(firstValue);
    const secondDate = new Date(secondValue);

    if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
        return false;
    }

    return firstDate.getTime() === secondDate.getTime();
};

const areSameReminderWeekdays = (firstValue = [], secondValue = []) => {
    if (firstValue.length !== secondValue.length) {
        return false;
    }

    return firstValue.every((dayValue, index) => dayValue === secondValue[index]);
};

const hasReminderScheduleChanged = (existingTask, reminderSettings) => {
    return !areSameReminderDates(existingTask.reminder, reminderSettings.reminder) ||
        (existingTask.reminderRepeat || REMINDER_REPEAT_VALUES.ONCE) !== reminderSettings.reminderRepeat ||
        !areSameReminderWeekdays(existingTask.reminderWeekdays || [], reminderSettings.reminderWeekdays || []);
};

const normalizeNoteType = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const normalizedValue = String(value || "").trim().toLowerCase();

    if (!NOTE_TYPE_OPTIONS.includes(normalizedValue)) {
        throw createBadRequestError("Note type is invalid.");
    }

    return normalizedValue;
};

const normalizeColor = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const normalizedValue = String(value || "").trim().toLowerCase() || "default";

    if (!NOTE_COLOR_OPTIONS.includes(normalizedValue)) {
        throw createBadRequestError("Note color is invalid.");
    }

    return normalizedValue;
};

const normalizeBackground = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const normalizedValue = String(value || "").trim().toLowerCase() || "none";

    if (!NOTE_BACKGROUND_OPTIONS.includes(normalizedValue)) {
        throw createBadRequestError("Note background is invalid.");
    }

    return normalizedValue;
};

const normalizeLabels = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return [];
    }

    if (!Array.isArray(value)) {
        throw createBadRequestError("Labels must be provided as a list.");
    }

    const nextLabels = [];
    const seenLabels = new Set();

    value.forEach((rawLabel) => {
        const label = toTrimmedString(rawLabel).replace(/^#/, "");

        if (!label) {
            return;
        }

        if (label.length > LABEL_MAX_LENGTH) {
            throw createBadRequestError(`Labels must be ${LABEL_MAX_LENGTH} characters or fewer.`);
        }

        const dedupeKey = label.toLowerCase();

        if (!seenLabels.has(dedupeKey)) {
            seenLabels.add(dedupeKey);
            nextLabels.push(label);
        }
    });

    return nextLabels;
};

const normalizeCollaborators = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return [];
    }

    if (!Array.isArray(value)) {
        throw createBadRequestError("Collaborators must be provided as a list.");
    }

    const nextCollaborators = [];
    const seenCollaborators = new Set();

    value.forEach((rawCollaborator) => {
        const email = toTrimmedString(rawCollaborator).toLowerCase();

        if (!email) {
            return;
        }

        if (email.length > COLLABORATOR_MAX_LENGTH) {
            throw createBadRequestError(`Collaborator email addresses must be ${COLLABORATOR_MAX_LENGTH} characters or fewer.`);
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw createBadRequestError("Collaborators must use valid email addresses.");
        }

        if (!seenCollaborators.has(email)) {
            seenCollaborators.add(email);
            nextCollaborators.push(email);
        }
    });

    return nextCollaborators;
};

const normalizeImageData = (value) => {
    if (value === undefined) {
        return undefined;
    }

    const imageData = String(value || "").trim();

    if (imageData.length > IMAGE_DATA_MAX_LENGTH) {
        throw createBadRequestError("Image note content is too large.");
    }

    return imageData;
};

const normalizeChecklistItems = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return [];
    }

    if (!Array.isArray(value)) {
        throw createBadRequestError("Checklist items must be provided as a list.");
    }

    return value
        .map((rawItem, index) => {
            const itemId = toTrimmedString(rawItem?.itemId || rawItem?.id || new mongoose.Types.ObjectId().toString());
            const text = toTrimmedString(rawItem?.text);

            if (text.length > CHECKLIST_ITEM_TEXT_MAX_LENGTH) {
                throw createBadRequestError(`Checklist items must be ${CHECKLIST_ITEM_TEXT_MAX_LENGTH} characters or fewer.`);
            }

            return {
                itemId,
                text,
                checked: Boolean(rawItem?.checked),
                order: Number.isFinite(Number(rawItem?.order)) ? Number(rawItem.order) : index
            };
        })
        .filter((item) => item.text.length > 0)
        .sort((firstItem, secondItem) => firstItem.order - secondItem.order)
        .map((item, index) => ({
            ...item,
            order: index
        }));
};

const extractLabelsFromText = (...values) => {
    const labels = [];
    const seenLabels = new Set();
    const labelRegex = /#([a-z0-9][a-z0-9-_]{0,39})/gi;

    values.forEach((value) => {
        const text = String(value || "");

        for (const match of text.matchAll(labelRegex)) {
            const rawLabel = (match[1] || "").trim();

            if (!rawLabel) {
                continue;
            }

            const dedupeKey = rawLabel.toLowerCase();

            if (!seenLabels.has(dedupeKey)) {
                seenLabels.add(dedupeKey);
                labels.push(rawLabel);
            }
        }
    });

    return labels;
};

const mergeLabels = (...labelGroups) => {
    const mergedLabels = [];
    const seenLabels = new Set();

    labelGroups.flat().forEach((label) => {
        const cleanLabel = toTrimmedString(label);

        if (!cleanLabel) {
            return;
        }

        const dedupeKey = cleanLabel.toLowerCase();

        if (!seenLabels.has(dedupeKey)) {
            seenLabels.add(dedupeKey);
            mergedLabels.push(cleanLabel);
        }
    });

    return mergedLabels;
};

const resolveNoteType = ({ noteType, checklistItems = [], imageData = "" }) => {
    if (noteType) {
        return noteType;
    }

    if (checklistItems.length > 0) {
        return "checklist";
    }

    if (imageData) {
        return "image";
    }

    return "text";
};

const deriveCompletedState = ({ noteType, checklistItems = [], completed = false }) => {
    if (noteType === "checklist" && checklistItems.length > 0) {
        return checklistItems.every((item) => item.checked);
    }

    return Boolean(completed);
};

const validateNoteContent = ({ title = "", description = "", checklistItems = [], imageData = "", noteType = "text" }) => {
    const hasChecklistText = checklistItems.some((item) => item.text);
    const hasContent = Boolean(title || description || hasChecklistText || imageData || noteType === "drawing");

    if (!hasContent) {
        throw createBadRequestError("Add a title, note content, checklist item, image, or drawing.");
    }
};

const normalizeTrashedAt = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw createBadRequestError("Trash date is invalid.");
    }

    return date;
};

const purgeExpiredTrash = async (userId) => {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_MS);
    const filter = {
        trashedAt: { $ne: null, $lte: cutoff }
    };

    if (userId) {
        filter.user = userId;
    }

    await Task.deleteMany(filter);
};

const buildSearchFilter = (search) => {
    if (!search) {
        return null;
    }

    return {
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { labels: { $elemMatch: { $regex: search, $options: "i" } } },
            { collaborators: { $elemMatch: { $regex: search, $options: "i" } } },
            { "checklistItems.text": { $regex: search, $options: "i" } }
        ]
    };
};

const buildSerializedNote = ({
    title,
    description,
    completed,
    noteType,
    checklistItems,
    pinned,
    archived,
    trashedAt,
    color,
    background,
    labels,
    collaborators,
    imageData,
    reminder,
    reminderRepeat,
    reminderWeekdays,
    reminderPlace,
    reminderNotificationSentAt,
    user
}) => ({
    title,
    description,
    completed,
    noteType,
    checklistItems,
    pinned,
    archived,
    trashedAt,
    color,
    background,
    labels,
    collaborators,
    imageData,
    reminder,
    reminderRepeat,
    reminderWeekdays,
    reminderPlace,
    reminderNotificationSentAt,
    user
});

const normalizeCreatePayload = (body, userId) => {
    const title = normalizeTitle(body.title) ?? "";
    const description = normalizeDescription(body.description) ?? "";
    const checklistItems = normalizeChecklistItems(body.checklistItems) ?? [];
    const imageData = normalizeImageData(body.imageData) ?? "";
    const noteType = resolveNoteType({
        noteType: normalizeNoteType(body.noteType),
        checklistItems,
        imageData
    });
    const completed = deriveCompletedState({
        noteType,
        checklistItems,
        completed: normalizeBoolean(body.completed, "Completed status") ?? false
    });
    const reminderSettings = normalizeReminderSettings({
        reminder: normalizeReminder(body.reminder),
        reminderRepeat: normalizeReminderRepeat(body.reminderRepeat) ?? REMINDER_REPEAT_VALUES.ONCE,
        reminderWeekdays: normalizeReminderWeekdays(body.reminderWeekdays) ?? [],
        reminderPlace: normalizeReminderPlace(body.reminderPlace) ?? ""
    });
    const labels = mergeLabels(
        normalizeLabels(body.labels) ?? [],
        extractLabelsFromText(title, description, ...checklistItems.map((item) => item.text))
    );
    const collaborators = normalizeCollaborators(body.collaborators) ?? [];
    const pinned = normalizeBoolean(body.pinned, "Pinned state") ?? false;
    const archived = normalizeBoolean(body.archived, "Archived state") ?? false;
    const trashedAt = normalizeTrashedAt(body.trashedAt) ?? null;
    const color = normalizeColor(body.color) ?? "default";
    const background = normalizeBackground(body.background) ?? "none";

    validateNoteContent({
        title,
        description,
        checklistItems,
        imageData,
        noteType
    });

    return buildSerializedNote({
        title,
        description,
        completed,
        noteType,
        checklistItems,
        pinned: trashedAt ? false : pinned,
        archived: trashedAt ? false : archived,
        trashedAt,
        color,
        background,
        labels,
        collaborators,
        imageData,
        reminder: reminderSettings.reminder,
        reminderRepeat: reminderSettings.reminderRepeat,
        reminderWeekdays: reminderSettings.reminderWeekdays,
        reminderPlace: reminderSettings.reminderPlace,
        reminderNotificationSentAt: null,
        user: userId
    });
};

const normalizeUpdatePayload = (body, existingTask) => {
    const nextTitle = Object.prototype.hasOwnProperty.call(body, "title")
        ? normalizeTitle(body.title)
        : existingTask.title;
    const nextDescription = Object.prototype.hasOwnProperty.call(body, "description")
        ? normalizeDescription(body.description)
        : existingTask.description;
    const nextChecklistItems = Object.prototype.hasOwnProperty.call(body, "checklistItems")
        ? normalizeChecklistItems(body.checklistItems)
        : existingTask.checklistItems;
    const nextImageData = Object.prototype.hasOwnProperty.call(body, "imageData")
        ? normalizeImageData(body.imageData)
        : existingTask.imageData;
    const nextNoteType = resolveNoteType({
        noteType: Object.prototype.hasOwnProperty.call(body, "noteType")
            ? normalizeNoteType(body.noteType)
            : existingTask.noteType,
        checklistItems: nextChecklistItems,
        imageData: nextImageData
    });
    const nextCompleted = deriveCompletedState({
        noteType: nextNoteType,
        checklistItems: nextChecklistItems,
        completed: Object.prototype.hasOwnProperty.call(body, "completed")
            ? normalizeBoolean(body.completed, "Completed status")
            : existingTask.completed
    });
    const reminderSettings = normalizeReminderSettings({
        reminder: Object.prototype.hasOwnProperty.call(body, "reminder")
            ? normalizeReminder(body.reminder)
            : existingTask.reminder,
        reminderRepeat: Object.prototype.hasOwnProperty.call(body, "reminderRepeat")
            ? normalizeReminderRepeat(body.reminderRepeat)
            : existingTask.reminderRepeat,
        reminderWeekdays: Object.prototype.hasOwnProperty.call(body, "reminderWeekdays")
            ? normalizeReminderWeekdays(body.reminderWeekdays)
            : existingTask.reminderWeekdays,
        reminderPlace: Object.prototype.hasOwnProperty.call(body, "reminderPlace")
            ? normalizeReminderPlace(body.reminderPlace)
            : existingTask.reminderPlace
    });
    const nextLabels = mergeLabels(
        Object.prototype.hasOwnProperty.call(body, "labels")
            ? normalizeLabels(body.labels)
            : existingTask.labels,
        extractLabelsFromText(nextTitle, nextDescription, ...nextChecklistItems.map((item) => item.text))
    );
    const nextCollaborators = Object.prototype.hasOwnProperty.call(body, "collaborators")
        ? normalizeCollaborators(body.collaborators)
        : existingTask.collaborators;
    const nextTrashedAt = Object.prototype.hasOwnProperty.call(body, "trashedAt")
        ? normalizeTrashedAt(body.trashedAt)
        : existingTask.trashedAt;
    const nextPinned = Object.prototype.hasOwnProperty.call(body, "pinned")
        ? normalizeBoolean(body.pinned, "Pinned state")
        : existingTask.pinned;
    const nextArchived = Object.prototype.hasOwnProperty.call(body, "archived")
        ? normalizeBoolean(body.archived, "Archived state")
        : existingTask.archived;
    const nextColor = Object.prototype.hasOwnProperty.call(body, "color")
        ? normalizeColor(body.color)
        : existingTask.color;
    const nextBackground = Object.prototype.hasOwnProperty.call(body, "background")
        ? normalizeBackground(body.background)
        : existingTask.background;

    validateNoteContent({
        title: nextTitle,
        description: nextDescription,
        checklistItems: nextChecklistItems,
        imageData: nextImageData,
        noteType: nextNoteType
    });

    return buildSerializedNote({
        title: nextTitle,
        description: nextDescription,
        completed: nextCompleted,
        noteType: nextNoteType,
        checklistItems: nextChecklistItems,
        pinned: nextTrashedAt ? false : nextPinned,
        archived: nextTrashedAt ? false : nextArchived,
        trashedAt: nextTrashedAt,
        color: nextColor,
        background: nextBackground,
        labels: nextLabels,
        collaborators: nextCollaborators,
        imageData: nextImageData,
        reminder: reminderSettings.reminder,
        reminderRepeat: reminderSettings.reminderRepeat,
        reminderWeekdays: reminderSettings.reminderWeekdays,
        reminderPlace: reminderSettings.reminderPlace,
        reminderNotificationSentAt: !reminderSettings.reminder || hasReminderScheduleChanged(existingTask, reminderSettings)
            ? null
            : existingTask.reminderNotificationSentAt,
        user: existingTask.user
    });
};

export const taskCreate = async (req, res) => {
    try {
        const nextNote = normalizeCreatePayload(req.body, req.user._id);
        const createdTask = await Task.create(nextNote);

        await Notification.create({
            user: req.user._id,
            message: `New note created: ${createdTask.title || "Untitled note"}`,
            type: "task_created"
        });

        res.status(201).json({
            message: "New note created",
            data: createdTask
        });
    } catch (error) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);

        res.status(statusCode).json({
            message: statusCode === 400 ? error.message : "Server Error"
        });
    }
};

export const getTask = async (req, res) => {
    try {
        await purgeExpiredTrash(req.user._id);

        const filter = {
            user: req.user._id
        };

        if (req.query.completed !== undefined) {
            filter.completed = req.query.completed === "true";
        }

        if (req.query.hasReminder === "true") {
            filter.reminder = { $ne: null };
        }

        if (req.query.noteType) {
            filter.noteType = normalizeNoteType(req.query.noteType);
        }

        if (req.query.label) {
            filter.labels = req.query.label.replace(/^#/, "");
        }

        if (req.query.pinned === "true") {
            filter.pinned = true;
        }

        const includeTrashed = req.query.trashed === "true";
        const includeArchived = req.query.archived === "true";

        if (includeTrashed) {
            filter.trashedAt = { $ne: null };
        } else {
            filter.trashedAt = null;
            filter.archived = includeArchived;
        }

        const searchFilter = buildSearchFilter(req.query.search);

        if (searchFilter) {
            Object.assign(filter, searchFilter);
        }

        let query = Task.find(filter);
        const sortTask = req.query.sort;

        if (sortTask) {
            query = query.sort(sortTask);
        } else {
            query = query.sort("-pinned -updatedAt");
        }

        const shouldPaginate = req.query.all !== "true";

        if (shouldPaginate) {
            const page = Number(req.query.page) || 1;
            const limit = Math.min(Number(req.query.limit) || 20, 100);
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
        }

        const tasks = await query;

        res.status(200).json({
            tasks,
            data: tasks
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : "Server Error"
        });
    }
};

export const getSingleTask = async (req, res) => {
    try {
        const singleTask = await Task.findById(req.params.id);

        if (!singleTask) {
            return res.status(404).json({
                message: "Note not found."
            });
        }

        if (singleTask.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to access this note."
            });
        }

        return res.status(200).json({
            data: singleTask
        });
    } catch {
        return res.status(500).json({
            message: "Server Error"
        });
    }
};

export const updateTask = async (req, res) => {
    try {
        const existingTask = await Task.findById(req.params.id);

        if (!existingTask) {
            return res.status(404).json({
                message: "Note not found."
            });
        }

        if (existingTask.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to edit this note."
            });
        }

        const nextNote = normalizeUpdatePayload(req.body, existingTask);

        const updateTask = await Task.findByIdAndUpdate(
            req.params.id,
            nextNote,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            data: updateTask
        });
    } catch (error) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);

        return res.status(statusCode).json({
            message: statusCode === 400 ? error.message : "Server Error"
        });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const deleteTask = await Task.findById(req.params.id);

        if (!deleteTask) {
            return res.status(404).json({
                message: "Note not found."
            });
        }

        if (deleteTask.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this note."
            });
        }

        await deleteTask.deleteOne();

        return res.status(200).json({
            message: "Note permanently deleted."
        });
    } catch {
        return res.status(500).json({
            message: "Server Error"
        });
    }
};

export const taskStats = async (req, res) => {
    try {
        await purgeExpiredTrash(req.user._id);

        const userId = req.user._id;
        const stats = await Task.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    totalTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$trashedAt", null] }, 1, 0]
                        }
                    },
                    completedTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$trashedAt", null] },
                                        { $eq: ["$completed", true] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    pendingTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$trashedAt", null] },
                                        { $eq: ["$completed", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    archivedNotes: {
                        $sum: {
                            $cond: [{ $eq: ["$archived", true] }, 1, 0]
                        }
                    },
                    trashedNotes: {
                        $sum: {
                            $cond: [{ $ne: ["$trashedAt", null] }, 1, 0]
                        }
                    },
                    pinnedNotes: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$trashedAt", null] },
                                        { $eq: ["$pinned", true] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    reminderNotes: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$trashedAt", null] },
                                        { $ne: ["$reminder", null] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            archivedNotes: 0,
            trashedNotes: 0,
            pinnedNotes: 0,
            reminderNotes: 0
        };

        return res.status(200).json({
            status: "success",
            data: result
        });
    } catch {
        return res.status(500).json({
            message: "Server Error"
        });
    }
};
