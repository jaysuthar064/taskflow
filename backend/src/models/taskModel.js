import mongoose from "mongoose";
import { REMINDER_REPEAT_OPTIONS, REMINDER_REPEAT_VALUES } from "../utils/reminderSchedule.js";

const TASK_TITLE_MAX_LENGTH = 120;
const TASK_DESCRIPTION_MAX_LENGTH = 1200;

const taskSchema= new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim: true,
            maxlength: TASK_TITLE_MAX_LENGTH
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
        reminderNotificationSentAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps:true
    }
);

const Task= mongoose.model("Task",taskSchema);

export default Task;
