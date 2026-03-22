import Task from "../models/taskModel.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";
import { REMINDER_REPEAT_OPTIONS, REMINDER_REPEAT_VALUES } from "../utils/reminderSchedule.js";

const TASK_TITLE_MAX_LENGTH = 120;
const TASK_DESCRIPTION_MAX_LENGTH = 1200;
const REMINDER_WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6];

const createBadRequestError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const normalizeTitle = (value) => {
    const title = String(value || "").trim();

    if (!title) {
        throw createBadRequestError("Task title is required.");
    }

    if (title.length > TASK_TITLE_MAX_LENGTH) {
        throw createBadRequestError(`Task title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.`);
    }

    return title;
};

const normalizeDescription = (value) => {
    const description = String(value || "").trim();

    if (description.length > TASK_DESCRIPTION_MAX_LENGTH) {
        throw createBadRequestError(`Task description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.`);
    }

    return description;
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

const normalizeReminderSettings = ({
    reminder,
    reminderRepeat = REMINDER_REPEAT_VALUES.ONCE,
    reminderWeekdays = []
}) => {
    if (!reminder) {
        return {
            reminder: null,
            reminderRepeat: REMINDER_REPEAT_VALUES.ONCE,
            reminderWeekdays: []
        };
    }

    if (reminderRepeat === REMINDER_REPEAT_VALUES.WEEKLY && reminderWeekdays.length === 0) {
        throw createBadRequestError("Select at least one day for a weekly reminder.");
    }

    return {
        reminder,
        reminderRepeat,
        reminderWeekdays: reminderRepeat === REMINDER_REPEAT_VALUES.WEEKLY ? reminderWeekdays : []
    };
};

const normalizeCompleted = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== "boolean") {
        throw createBadRequestError("Completed status must be true or false.");
    }

    return value;
};

//Create Task Controller
export const taskCreate=async(req,res)=>{
    try{
        const {title,description,completed,reminder,reminderRepeat,reminderWeekdays}=req.body;
        const user= req.user._id;
        const normalizedTitle = normalizeTitle(title);
        const normalizedDescription = normalizeDescription(description);
        const normalizedCompleted = normalizeCompleted(completed) ?? false;
        const normalizedReminder = normalizeReminder(reminder);
        const normalizedReminderRepeat = normalizeReminderRepeat(reminderRepeat) ?? REMINDER_REPEAT_VALUES.ONCE;
        const normalizedReminderWeekdays = normalizeReminderWeekdays(reminderWeekdays) ?? [];
        const normalizedReminderSettings = normalizeReminderSettings({
            reminder: normalizedReminder,
            reminderRepeat: normalizedReminderRepeat,
            reminderWeekdays: normalizedReminderWeekdays
        });

        const createTask= await Task.create({
            title: normalizedTitle,
            description: normalizedDescription,
            user,
            completed: normalizedCompleted,
            reminder: normalizedReminderSettings.reminder,
            reminderRepeat: normalizedReminderSettings.reminderRepeat,
            reminderWeekdays: normalizedReminderSettings.reminderWeekdays,
            reminderNotificationSentAt: null
        });

        if (createTask){
            // Create real-time notification
            await Notification.create({
                user,
                message: `New task created: ${normalizedTitle}`,
                type: "task_created"
            });

            res.status(201).json({
                message:`New task created`,
                data:createTask
            });
        }
    }catch(error){
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);

        res.status(statusCode).json({
            message: statusCode === 400 ? error.message : "Server Error"
        });
    }
}

//Get all task Controller
export const getTask=async(req,res)=>{
    try{
        const filter = {
            user:req.user._id
        }
        //Filtering Task
        if(req.query.completed !== undefined){
            filter.completed = req.query.completed === "true";
        }

        if(req.query.search){
            filter.$or=[
                {title:{$regex:req.query.search,$options:"i"}},
                {description:{$regex:req.query.search,$options:"i"}}
            ];
        }

        if(req.query.hasReminder === "true"){
            filter.reminder = { $ne: null };
        }

        let query = Task.find(filter)

        //Sorting Task
        const sortTask = req.query.sort;
        if(sortTask){
            query = query.sort(sortTask);
        }else{
            query = query.sort("-createdAt");
        }

        //Pagination
        const shouldPaginate = req.query.all !== "true";
        if (shouldPaginate) {
            const page = Number(req.query.page) || 1;
            const limit = Math.min(Number(req.query.limit) || 10 , 50);
            const skip = (page -1) * limit;
            query = query.skip(skip).limit(limit);
        }

        const tasks = await query;

        res.status(200).json({
            tasks,
            data:tasks
        });
    }catch(error){
        res.status(500).json({
            message:`Server error`
        });
    }
}

//Get Specific task Controller
export const getSingleTask=async(req,res)=>{
    try{
       const singleTask= await Task.findById(req.params.id);
       if(!singleTask){
        return res.status(404).json({
            message:`Task not fetched!`
        });
       }

       if(singleTask.user.toString() !== req.user._id.toString()){
        return res.status(403).json({
            message:`You are not authorized to access this task`
        });
       }

        res.status(200).json({
            singleTask,
            data: singleTask
        });
    }catch(error){
        res.status(500).json({
            message:`Server Error`
        });
    }
}

//Update Task Controller
export const updateTask= async(req,res)=>{
    try{
        const existingTask = await Task.findById(req.params.id);

        if(!existingTask){
            return res.status(404).json({
                message:`Task not found`
            });
        }

        if(existingTask.user.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message:`You are not authorized to edit this task`
            });
        }

        const updates = {};

        if (Object.prototype.hasOwnProperty.call(req.body, "title")) {
            updates.title = normalizeTitle(req.body.title);
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
            updates.description = normalizeDescription(req.body.description);
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "completed")) {
            updates.completed = normalizeCompleted(req.body.completed);
        }

        const isReminderFieldSubmitted = (
            Object.prototype.hasOwnProperty.call(req.body, "reminder") ||
            Object.prototype.hasOwnProperty.call(req.body, "reminderRepeat") ||
            Object.prototype.hasOwnProperty.call(req.body, "reminderWeekdays")
        );

        if (isReminderFieldSubmitted) {
            const nextReminderSettings = normalizeReminderSettings({
                reminder: Object.prototype.hasOwnProperty.call(req.body, "reminder")
                    ? normalizeReminder(req.body.reminder)
                    : existingTask.reminder,
                reminderRepeat: Object.prototype.hasOwnProperty.call(req.body, "reminderRepeat")
                    ? normalizeReminderRepeat(req.body.reminderRepeat)
                    : existingTask.reminderRepeat,
                reminderWeekdays: Object.prototype.hasOwnProperty.call(req.body, "reminderWeekdays")
                    ? normalizeReminderWeekdays(req.body.reminderWeekdays)
                    : existingTask.reminderWeekdays
            });

            updates.reminder = nextReminderSettings.reminder;
            updates.reminderRepeat = nextReminderSettings.reminderRepeat;
            updates.reminderWeekdays = nextReminderSettings.reminderWeekdays;
            updates.reminderNotificationSentAt = null;
        }

        if (updates.completed === true) {
            updates.reminderNotificationSentAt = existingTask.reminderNotificationSentAt;
        }

        if (updates.completed === false && existingTask.completed === true && !Object.prototype.hasOwnProperty.call(updates, "reminderNotificationSentAt")) {
            updates.reminderNotificationSentAt = null;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one valid task field to update."
            });
        }

        const updateTask= await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            {new:true, runValidators: true}
        );

        // Create notification if completed status changed
        if (req.body.completed === true && existingTask.completed !== true) {
            await Notification.create({
                user: updateTask.user,
                message: `Task completed: ${updateTask.title}`,
                type: "task_completed"
            });
        }

        res.status(200).json({
            task:updateTask,
            data:updateTask
        });
    }catch(error){
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);

        res.status(statusCode).json({
            message: statusCode === 400 ? error.message : "Server Error"
        });
    }
}

//Delete Task Controller
export const deleteTask = async(req,res)=>{
    try{
        const deleteTask = await Task.findById(req.params.id);

        if(!deleteTask){
           return res.status(400).json({
                message:`Task not found`
            })
        }

        if(deleteTask.user.toString() !== req.user._id.toString()){
           return res.status(403).json({
                message:`You are not authorize to delete the task!`
            });
        }

        await deleteTask.deleteOne();

       return res.status(200).json({
            message:`Task successfully deleted`
        });
    }catch(error){
        res.status(500).json({
            message:`Server Error`
        });
    }
}

//Stats Controllers
export const taskStats = async(req,res)=>{
    try{
        const userId = req.user._id;
        const stats = await Task.aggregate([
            {
                $match : {user : new mongoose.Types.ObjectId(userId)}
            },
            {
                $group : {
                    _id : null ,
                    totalTasks : {$sum : 1},
                    completedTasks : {
                        $sum : {
                            $cond : [{$eq:["$completed",true]},1,0]
                        }
                    },
                    pendingTasks : {
                        $sum : {
                            $cond : [{ $eq:["$completed",false]},1,0]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalTasks : 0,
            completedTasks : 0,
            pendingTasks : 0
        }

        res.status(200).json({
            status : "success",
            data : result
        });
    }catch(error){
        res.status(500).json({
            message:`Server Error`
        });
    }
}
