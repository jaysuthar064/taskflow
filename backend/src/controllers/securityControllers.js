import Notification from "../models/Notification.js";
import PushSubscription from "../models/PushSubscription.js";
import Session from "../models/Session.js";
import Task from "../models/taskModel.js";
import User from "../models/User.js";
import { decryptValue, encryptValue } from "../utils/crypto.js";
import { createAuthenticatedSession, verifyTwoFactorChallengeToken } from "../utils/authTokens.js";
import { createTotpUri, formatSecretForDisplay, generateTwoFactorSecret, verifyTotpToken } from "../utils/totp.js";
import { getLoginMethods, hasPasswordLogin, serializeUser } from "../utils/userResponse.js";

const PASSWORD_MIN_LENGTH = 8;

const buildSessionResponse = (session, currentSessionTokenId) => ({
    id: session._id.toString(),
    loginMethod: session.loginMethod,
    deviceLabel: session.deviceLabel,
    browser: session.browser,
    os: session.os,
    deviceType: session.deviceType,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    lastActiveAt: session.lastActiveAt,
    createdAt: session.createdAt,
    isCurrent: session.sessionTokenId === currentSessionTokenId,
    twoFactorVerified: Boolean(session.twoFactorVerifiedAt)
});

const revokeOtherSessions = async (userId, currentSessionTokenId, reason) => {
    await Session.updateMany(
        {
            user: userId,
            sessionTokenId: { $ne: currentSessionTokenId },
            revokedAt: null
        },
        {
            $set: {
                revokedAt: new Date(),
                revokedReason: reason
            }
        }
    );
};

const ensurePasswordStrength = (newPassword) => {
    if (typeof newPassword !== "string" || newPassword.trim().length < PASSWORD_MIN_LENGTH) {
        throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
    }
};

const verifyTwoFactorCodeForUser = (user, code) => {
    if (!user.twoFactorEnabled) {
        return;
    }

    const secret = decryptValue(user.twoFactorSecret);
    const isValid = verifyTotpToken({
        secret,
        token: code
    });

    if (!isValid) {
        throw new Error("Invalid two-factor authentication code.");
    }
};

const verifyPasswordForUser = async (user, currentPassword) => {
    if (!hasPasswordLogin(user)) {
        return;
    }

    if (!currentPassword) {
        throw new Error("Current password is required.");
    }

    const isValidPassword = await user.comparePassword(currentPassword);

    if (!isValidPassword) {
        throw new Error("Current password is incorrect.");
    }
};

export const getSecurityOverview = async (req, res) => {
    try {
        const [user, sessions] = await Promise.all([
            User.findById(req.user._id),
            Session.find({
                user: req.user._id,
                revokedAt: null,
                expiresAt: { $gt: new Date() }
            }).sort({ lastActiveAt: -1 })
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            data: {
                loginMethods: getLoginMethods(user),
                twoFactor: {
                    enabled: Boolean(user.twoFactorEnabled)
                },
                sessions: sessions.map((session) =>
                    buildSessionResponse(session, req.session.sessionTokenId)
                ),
                activeSessionCount: sessions.length
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to load security settings."
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword = "", newPassword = "", totpCode = "" } = req.body;
        const user = await User.findById(req.user._id).select("+password +twoFactorSecret");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        ensurePasswordStrength(newPassword);
        await verifyPasswordForUser(user, currentPassword);
        verifyTwoFactorCodeForUser(user, totpCode);

        user.password = newPassword.trim();
        user.passwordConfigured = true;
        await user.save();

        await revokeOtherSessions(user._id, req.session.sessionTokenId, "password_changed");

        return res.status(200).json({
            message: "Password updated successfully. Other devices have been signed out.",
            user: serializeUser(user)
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Unable to update password."
        });
    }
};

export const startTwoFactorSetup = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+twoFactorTempSecret");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                message: "Two-factor authentication is already enabled."
            });
        }

        const secret = generateTwoFactorSecret();

        user.twoFactorTempSecret = encryptValue(secret);
        user.twoFactorTempCreatedAt = new Date();
        await user.save();

        return res.status(200).json({
            data: {
                secret,
                manualEntryKey: formatSecretForDisplay(secret),
                otpauthUrl: createTotpUri({
                    secret,
                    email: user.email,
                    issuer: process.env.TWO_FACTOR_ISSUER || "TaskFlow"
                })
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to start two-factor authentication setup."
        });
    }
};

export const confirmTwoFactorSetup = async (req, res) => {
    try {
        const { code = "" } = req.body;
        const user = await User.findById(req.user._id).select("+twoFactorTempSecret +twoFactorSecret");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.twoFactorTempSecret) {
            return res.status(400).json({
                message: "Start two-factor setup before verifying a code."
            });
        }

        const pendingSecret = decryptValue(user.twoFactorTempSecret);
        const isValidCode = verifyTotpToken({
            secret: pendingSecret,
            token: code
        });

        if (!isValidCode) {
            return res.status(400).json({
                message: "Invalid two-factor authentication code."
            });
        }

        user.twoFactorSecret = encryptValue(pendingSecret);
        user.twoFactorEnabled = true;
        user.twoFactorTempSecret = "";
        user.twoFactorTempCreatedAt = null;
        await user.save();

        req.session.twoFactorVerifiedAt = new Date();
        await req.session.save();

        await revokeOtherSessions(user._id, req.session.sessionTokenId, "two_factor_enabled");

        return res.status(200).json({
            message: "Two-factor authentication enabled successfully.",
            user: serializeUser(user)
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Unable to enable two-factor authentication."
        });
    }
};

export const disableTwoFactor = async (req, res) => {
    try {
        const { currentPassword = "", code = "" } = req.body;
        const user = await User.findById(req.user._id).select("+password +twoFactorSecret");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({
                message: "Two-factor authentication is not enabled."
            });
        }

        await verifyPasswordForUser(user, currentPassword);
        verifyTwoFactorCodeForUser(user, code);

        user.twoFactorEnabled = false;
        user.twoFactorSecret = "";
        user.twoFactorTempSecret = "";
        user.twoFactorTempCreatedAt = null;
        await user.save();

        req.session.twoFactorVerifiedAt = null;
        await req.session.save();

        await revokeOtherSessions(user._id, req.session.sessionTokenId, "two_factor_disabled");

        return res.status(200).json({
            message: "Two-factor authentication has been disabled.",
            user: serializeUser(user)
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Unable to disable two-factor authentication."
        });
    }
};

export const verifyTwoFactorChallenge = async (req, res) => {
    try {
        const { challengeToken = "", code = "" } = req.body;
        const challenge = verifyTwoFactorChallengeToken(challengeToken);
        const user = await User.findById(challenge.id).select("+twoFactorSecret");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({
                message: "Two-factor authentication is no longer enabled for this account."
            });
        }

        verifyTwoFactorCodeForUser(user, code);

        const { token } = await createAuthenticatedSession({
            user,
            req,
            loginMethod: challenge.loginMethod === "google" ? "google" : "password",
            twoFactorVerified: true
        });

        return res.status(200).json({
            message: "Two-factor authentication verified successfully.",
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        return res.status(401).json({
            message: error.message || "Unable to verify two-factor authentication."
        });
    }
};

export const revokeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findOne({
            _id: sessionId,
            user: req.user._id,
            revokedAt: null
        });

        if (!session) {
            return res.status(404).json({
                message: "Session not found."
            });
        }

        session.revokedAt = new Date();
        session.revokedReason = "session_revoked";
        await session.save();

        return res.status(200).json({
            message: "Session signed out successfully.",
            signedOutCurrentSession: session.sessionTokenId === req.session.sessionTokenId
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to sign out that session."
        });
    }
};

export const logoutCurrentSession = async (req, res) => {
    try {
        req.session.revokedAt = new Date();
        req.session.revokedReason = "logged_out";
        await req.session.save();

        return res.status(200).json({
            message: "Signed out successfully."
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to sign out right now."
        });
    }
};

export const logoutAllSessions = async (req, res) => {
    try {
        const revokedAt = new Date();

        await Promise.all([
            Session.updateMany(
                {
                    user: req.user._id,
                    revokedAt: null
                },
                {
                    $set: {
                        revokedAt,
                        revokedReason: "logged_out_all_devices"
                    }
                }
            ),
            PushSubscription.deleteMany({ user: req.user._id })
        ]);

        return res.status(200).json({
            message: "All devices have been signed out."
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to sign out all devices."
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const {
            confirmationText = "",
            currentPassword = "",
            totpCode = ""
        } = req.body;
        const user = await User.findById(req.user._id).select("+password +twoFactorSecret");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (confirmationText.trim().toLowerCase() !== user.email.toLowerCase()) {
            return res.status(400).json({
                message: "Enter your account email to confirm deletion."
            });
        }

        await verifyPasswordForUser(user, currentPassword);
        verifyTwoFactorCodeForUser(user, totpCode);

        await Promise.all([
            Session.deleteMany({ user: user._id }),
            Task.deleteMany({ user: user._id }),
            Notification.deleteMany({ user: user._id }),
            PushSubscription.deleteMany({ user: user._id }),
            User.deleteOne({ _id: user._id })
        ]);

        return res.status(200).json({
            message: "Your account has been permanently deleted."
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Unable to delete account."
        });
    }
};
