import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";

const app = express();

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

//Routes
app.use("/api/v1/auth", authRoutes);

//Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Taskflow api is working"
    });
});

export default app;