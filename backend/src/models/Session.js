import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sessionTokenId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        loginMethod: {
            type: String,
            enum: ["password", "google"],
            required: true
        },
        ipAddress: {
            type: String,
            default: ""
        },
        userAgent: {
            type: String,
            default: ""
        },
        browser: {
            type: String,
            default: "Unknown Browser"
        },
        os: {
            type: String,
            default: "Unknown OS"
        },
        deviceType: {
            type: String,
            default: "Desktop"
        },
        deviceLabel: {
            type: String,
            default: "Unknown device"
        },
        lastActiveAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        revokedAt: {
            type: Date,
            default: null,
            index: true
        },
        revokedReason: {
            type: String,
            default: ""
        },
        twoFactorVerifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

sessionSchema.index({ user: 1, revokedAt: 1, lastActiveAt: -1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
