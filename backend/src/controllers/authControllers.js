import User from "../models/user.js";
import Task from "../models/taskModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Register Controller
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExixts = await User.findOne({ email });
        if (userExixts) {
            return res.status(400).json({ message: `User already exists` });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            message: `User registration successful`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })
    } catch (error) {
        res.status(500).json({ message: `Server error` });
    }
}

//Login Controller
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                message: `Invalid email and password`
            });
        }

        //Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: `Invalid email and password`
            });
        }

        //Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(200).json({
            message: `Login successfully`,
            token
        });
    } catch (error) {
        res.status(500).json({
            message: `Server Error`
        });
    }
}

//Create Task Controller
export const taskCreate=async(req,res)=>{
    try{
        const {title,description}=req.body;
        const user= req.user._id;

        const createTask= await Task.create({
            title,
            description,
            user
        });

        if (createTask){
            res.status(201).json({
                message:`New task created`,
                title:title,
                description:description,
                user:user
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
        const allTasks= await Task.find({user:req.user._id})

        res.status(200).json({
            allTasks
        });
    }catch(error){
        res.status(500).json({
            message:`Server error`
        });
    }
}

//Get Specific Controller
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

//Update Controller
export const updateTask= async(req,res)=>{
    try{
        const updateTask= await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );

        if(updateTask.user.toString() !== req.user._id.toString()){
        res.status(403).json({
            message:`You are not authorized to edit this task`
        });
       }

       res.status(200).json({
         task:updateTask
       });
    }catch(error){
        res.status(500).json({
            message:`Server Error`
        });
    }
}

//Delete Controller
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