import User from "../models/User.js";
import Task from "../models/taskModel.js";
import Notification from "../models/Notification.js";
import { createAuthenticatedSession } from "../utils/authTokens.js";
import { serializeUser } from "../utils/userResponse.js";

const PASSWORD_MIN_LENGTH = 8;

const buildDuplicateEmailMessage = () => ({
    message: "An account with that email already exists."
});

const ensurePasswordStrength = (password) => {
    if (typeof password !== "string" || password.trim().length < PASSWORD_MIN_LENGTH) {
        throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
    }
};

//Register Controller
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        ensurePasswordStrength(password);

        const normalizedEmail = String(email || "").trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });

        if (userExists) {
            return res.status(400).json({ message: `User already exists` });
        }

        const user = await User.create({
            name: String(name || "").trim(),
            email: normalizedEmail,
            password: password.trim(),
            passwordConfigured: true
        });

        const { token } = await createAuthenticatedSession({
            user,
            req,
            loginMethod: "password"
        });

        res.status(201).json({
            message: `User registration successful`,
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        if (error.message?.includes("Password must be")) {
            return res.status(400).json({ message: error.message });
        }

        if (error.code === 11000) {
            return res.status(400).json(buildDuplicateEmailMessage());
        }

        res.status(500).json({ message: `Server error` });
    }
}

//Login Controller
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(400).json({
                message: `Invalid email and password`
            });
        }

        if (user.passwordConfigured === false) {
            return res.status(400).json({
                message: "Password sign-in is not enabled for this account yet."
            });
        }

        //Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: `Invalid email and password`
            });
        }

        if (user.passwordConfigured !== true) {
            user.passwordConfigured = true;
            await user.save();
        }

        const { token } = await createAuthenticatedSession({
            user,
            req,
            loginMethod: "password",
            twoFactorVerified: Boolean(user.twoFactorEnabled)
        });

        res.status(200).json({
            message: `Login successfully`,
            token,
            user: serializeUser(user)
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
        const serializedUser = serializeUser(user);
        const userData = JSON.stringify(serializedUser);

        // Redirect to frontend with token and user data
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

        const { token } = await createAuthenticatedSession({
            user,
            req,
            loginMethod: "google",
            twoFactorVerified: Boolean(user.twoFactorEnabled)
        });
        const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(userData)}`;

        res.redirect(redirectUrl);
    } catch (error) {
        res.status(500).json({
            message: `OAuth Redirection Error`
        });
    }
}

export const getProfile = async (req, res) => {
    return res.status(200).json({
        message: "Protected route accessed",
        user: serializeUser(req.user)
    });
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const normalizedEmail = String(email || "").trim().toLowerCase();

        if (normalizedEmail && normalizedEmail !== user.email) {
            return res.status(400).json({
                message: "Email address is fixed for this account and cannot be changed."
            });
        }

        const trimmedName = String(name || "").trim();

        if (!trimmedName) {
            return res.status(400).json({
                message: "Name is required."
            });
        }

        user.name = trimmedName;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: serializeUser(user)
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
