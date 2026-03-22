import mongoose from "mongoose";
import { REMINDER_REPEAT_OPTIONS, REMINDER_REPEAT_VALUES } from "../utils/reminderSchedule.js";

const TASK_TITLE_MAX_LENGTH = 120;
const TASK_DESCRIPTION_MAX_LENGTH = 4000;
const CHECKLIST_ITEM_TEXT_MAX_LENGTH = 280;
const COLLABORATOR_MAX_LENGTH = 120;
const LABEL_MAX_LENGTH = 40;
const REMINDER_PLACE_MAX_LENGTH = 120;
const IMAGE_DATA_MAX_LENGTH = 2_500_000;

export const NOTE_TYPE_OPTIONS = Object.freeze([
    "text",
    "checklist",
    "image",
    "drawing"
]);

export const NOTE_COLOR_OPTIONS = Object.freeze([
    "default",
    "coral",
    "peach",
    "sand",
    "mint",
    "sage",
    "fog",
    "storm",
    "dusk",
    "blossom",
    "clay",
    "chalk"
]);

export const NOTE_BACKGROUND_OPTIONS = Object.freeze([
    "none",
    "groceries",
    "food",
    "music",
    "recipes",
    "notes",
    "travel"
]);

const checklistItemSchema = new mongoose.Schema(
    {
        itemId: {
            type: String,
            required: true,
            trim: true
        },
        text: {
            type: String,
            trim: true,
            maxlength: CHECKLIST_ITEM_TEXT_MAX_LENGTH,
            default: ""
        },
        checked: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

const taskSchema= new mongoose.Schema(
    {
        title:{
            type:String,
            trim: true,
            maxlength: TASK_TITLE_MAX_LENGTH,
            default: ""
        },
        description:{
            type:String,
            trim: true,
            maxlength: TASK_DESCRIPTION_MAX_LENGTH,
            default: ""
        },
        completed:{
            type:Boolean,
            default:false
        },
        noteType: {
            type: String,
            enum: NOTE_TYPE_OPTIONS,
            default: "text"
        },
        checklistItems: {
            type: [checklistItemSchema],
            default: []
        },
        pinned: {
            type: Boolean,
            default: false
        },
        archived: {
            type: Boolean,
            default: false
        },
        trashedAt: {
            type: Date,
            default: null
        },
        color: {
            type: String,
            enum: NOTE_COLOR_OPTIONS,
            default: "default"
        },
        background: {
            type: String,
            enum: NOTE_BACKGROUND_OPTIONS,
            default: "none"
        },
        labels: {
            type: [String],
            default: [],
            validate: {
                validator: (values = []) => values.every((value) => typeof value === "string" && value.length <= LABEL_MAX_LENGTH),
                message: `Labels must be ${LABEL_MAX_LENGTH} characters or fewer.`
            }
        },
        collaborators: {
            type: [String],
            default: [],
            validate: {
                validator: (values = []) => values.every((value) => typeof value === "string" && value.length <= COLLABORATOR_MAX_LENGTH),
                message: `Collaborator email addresses must be ${COLLABORATOR_MAX_LENGTH} characters or fewer.`
            }
        },
        imageData: {
            type: String,
            default: "",
            maxlength: IMAGE_DATA_MAX_LENGTH
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        reminder:{
            type:Date
        },
        reminderRepeat: {
            type: String,
            enum: REMINDER_REPEAT_OPTIONS,
            default: REMINDER_REPEAT_VALUES.ONCE
        },
        reminderWeekdays: {
            type: [Number],
            default: [],
            validate: {
                validator: (values = []) =>
                    values.every((value) => Number.isInteger(value) && value >= 0 && value <= 6),
                message: "Reminder weekdays must use values between 0 and 6."
            }
        },
        reminderPlace: {
            type: String,
            trim: true,
            maxlength: REMINDER_PLACE_MAX_LENGTH,
            default: ""
        },
        reminderNotificationSentAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps:true
    }
);

taskSchema.index({ user: 1, pinned: -1, updatedAt: -1 });
taskSchema.index({ user: 1, archived: 1, trashedAt: 1 });
taskSchema.index({ user: 1, reminder: 1 });

const Task= mongoose.model("Task",taskSchema);

export default Task;
