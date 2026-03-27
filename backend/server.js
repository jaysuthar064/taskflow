import "dotenv/config";

const { default: app } = await import("./src/app.js");
const { default: connectDB } = await import("./src/config/db.js");
const { startReminderProcessor } = await import("./src/services/reminderService.js");

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
