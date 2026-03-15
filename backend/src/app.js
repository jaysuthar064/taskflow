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
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

//Body Parser
app.use(express.json());
app.use(passport.initialize());

//Routes
app.use("/api/v1/", authRoutes);
app.use("/api/v1/",taskRoutes);

//Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Taskflow api is working"
    });
});

export default app;