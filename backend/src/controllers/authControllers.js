import User from "../models/User.js";
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
        // Using a query parameter for the token is common for simple OAuth flows
        // In production, you might want to use a more secure method or a dedicated callback page
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(userData)}`);
    } catch (error) {
        res.status(500).json({
            message: `OAuth Redirection Error`
        });
    }
}
