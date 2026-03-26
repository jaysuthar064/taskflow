import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use Google DNS (fixes SRV lookup issues on restricted networks)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not set");
        }

        const sanitizedUrl = process.env.MONGO_URL.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
        console.log(`Connecting to MongoDB: ${sanitizedUrl}`);

        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

export default connectDB;
