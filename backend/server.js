import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { startReminderProcessor } from "./src/services/reminderService.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
    await connectDB();
    startReminderProcessor();

    app.listen(PORT,()=>{
        console.log(`Taskflow API listening on port ${PORT}`);
    });
};

bootstrap().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
});
