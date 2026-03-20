import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            select: false
        },
        passwordConfigured: {
            type: Boolean,
            default: function defaultPasswordConfigured() {
                return Boolean(this.password);
            }
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            default: "",
            select: false
        },
        twoFactorTempSecret: {
            type: String,
            default: "",
            select: false
        },
        twoFactorTempCreatedAt: {
            type: Date,
            default: null,
            select: false
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    if (!this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfigured = true;
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }

    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
