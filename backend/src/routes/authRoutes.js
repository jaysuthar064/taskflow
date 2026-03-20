import express from "express";
import {
    clearNotifications,
    getNotifications,
    getProductivityStats,
    getProfile,
    googleAuthCallback,
    loginUser,
    registerUser,
    updateProfile
} from "../controllers/authControllers.js";
import { deletePushSubscription, getPushPublicKeyController, savePushSubscription } from "../controllers/pushControllers.js";
import {
    confirmTwoFactorSetup,
    deleteAccount,
    disableTwoFactor,
    getSecurityOverview,
    logoutAllSessions,
    logoutCurrentSession,
    revokeSession,
    startTwoFactorSetup,
    updatePassword,
    verifyTwoFactorChallenge
} from "../controllers/securityControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import passport from "passport";

const router = express.Router();

//Post Route
router.post("/register",registerUser);
router.post("/login",loginUser );
router.post("/two-factor/verify", verifyTwoFactorChallenge);

// Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    googleAuthCallback
);

router.post("/logout", protect, logoutCurrentSession);
router.post("/security/sessions/logout-all", protect, logoutAllSessions);
router.delete("/security/sessions/:sessionId", protect, revokeSession);
router.get("/security/overview", protect, getSecurityOverview);
router.put("/security/password", protect, updatePassword);
router.post("/security/2fa/setup", protect, startTwoFactorSetup);
router.post("/security/2fa/confirm", protect, confirmTwoFactorSetup);
router.post("/security/2fa/disable", protect, disableTwoFactor);
router.delete("/account", protect, deleteAccount);
router.get("/profile",protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/notifications", protect, getNotifications);
router.delete("/notifications", protect, clearNotifications);
router.get("/productivity-stats", protect, getProductivityStats);
router.get("/push/public-key", getPushPublicKeyController);
router.post("/push/subscriptions", protect, savePushSubscription);
router.delete("/push/subscriptions", protect, deletePushSubscription);

export default router;
