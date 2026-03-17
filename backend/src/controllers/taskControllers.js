import Task from "../models/taskModel.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

//Create Task Controller
export const taskCreate=async(req,res)=>{
    try{
        const {title,description,completed,reminder}=req.body;
        const user= req.user._id;

        const createTask= await Task.create({
            title,
            description,
            user,
            completed,
            reminder,
            reminderNotificationSentAt: null
        });

        if (createTask){
            // Create real-time notification
            await Notification.create({
                user,
                message: `New task created: ${title}`,
                type: "task_created"
            });

            res.status(201).json({
                message:`New task created`,
                data:createTask
            });
        }else{
            res.status(400).json({
                message:`Task not created client side error`
            });
        }
        
    }catch(error){
        res.status(500).json({
            message:`Server Error`
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
        res.status(400).json({
            message:`Task not fetched!`
        });
       }

       if(singleTask.user.toString() !== req.user._id.toString()){
        res.status(403).json({
            message:`You are not authorized to access this task`
        })
       }

        res.status(200).json({
            singleTask
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

        const updates = { ...req.body };

        if (Object.prototype.hasOwnProperty.call(updates, "reminder")) {
            updates.reminderNotificationSentAt = null;
        }

        if (updates.completed === true) {
            updates.reminderNotificationSentAt = existingTask.reminderNotificationSentAt;
        }

        const updateTask= await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            {new:true}
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
        res.status(500).json({
            message:`Server Error`
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
