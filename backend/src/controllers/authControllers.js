import User from "../models/User.js";
import Task from "../models/taskModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";

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

        // Generate JWT token for immediate login
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            message: `User registration successful`,
            token,
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
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: `Server Error`
        });
    }
}

// Google OAuth Callback Controller
export const googleAuthCallback = async (req, res) => {
    try {
        const user = req.user;
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        const userData = JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
        });

        // Redirect to frontend with token and user data
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
        const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(userData)}`;
        
        res.redirect(redirectUrl);
    } catch (error) {
        res.status(500).json({
            message: `OAuth Redirection Error`
        });
    }
}

// Update Profile Controller
export const updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
}

// Get Notifications Controller
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ data: notifications });
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
}

// Clear Notifications Controller
export const clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user._id });
        res.status(200).json({ message: "Notifications cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing notifications" });
    }
}

// Get Productivity Stats Controller
export const getProductivityStats = async (req, res) => {
    try {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            last7Days.push(date);
        }

        const stats = await Promise.all(last7Days.map(async (date) => {
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const completedCount = await Task.countDocuments({
                user: req.user._id,
                completed: true,
                updatedAt: { $gte: date, $lt: nextDate }
            });

            const createdCount = await Task.countDocuments({
                user: req.user._id,
                createdAt: { $gte: date, $lt: nextDate }
            });

            return {
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toISOString().split('T')[0],
                completed: completedCount,
                created: createdCount
            };
        }));

        res.status(200).json({ data: stats });
    } catch (error) {
        res.status(500).json({ message: "Error fetching productivity stats" });
    }
}

