import express from "express";
import { loginUser, registerUser, googleAuthCallback, updateProfile, getNotifications, getProductivityStats, clearNotifications } from "../controllers/authControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import passport from "passport";

const router = express.Router();

//Post Route
router.post("/register",registerUser);
router.post("/login",loginUser );

// Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    googleAuthCallback
);

router.get("/profile",protect,(req,res)=>{
    res.json({
        message:`Protected route accessed`,
        user:req.user
    });
});

router.put("/profile", protect, updateProfile);
router.get("/notifications", protect, getNotifications);
router.delete("/notifications", protect, clearNotifications);
router.get("/productivity-stats", protect, getProductivityStats);

export default router;