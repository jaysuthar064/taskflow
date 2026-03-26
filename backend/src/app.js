import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import passport from "./config/passport.js";

const app = express();
app.set("trust proxy", 1);

//Security middleware 
app.use(helmet()); 
app.use(cors({ origin: true, credentials: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
});

app.use(limiter); 

// Request Logger
if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

//Body Parser
app.use(express.json({ limit: "5mb" }));
app.use(passport.initialize());

//Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", taskRoutes);

//Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Taskflow api is working"
    });
});

// 404 Handler for API
app.use("/api/v1", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Route ${req.originalUrl} not found on this server!`
    });
});

export default app;
