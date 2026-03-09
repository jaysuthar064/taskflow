import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { deleteTask, getSingleTask, getTask, taskCreate, taskStats, updateTask } from "../controllers/taskControllers.js";

const router = express.Router();

//Post Route
router.post("/tasks",protect,taskCreate);

//Get Route
router.get("/tasks",protect,getTask);
router.get("/tasks/stats",protect,taskStats);
router.get("/tasks/:id",protect,getSingleTask);

//Patch Route
router.patch("/tasks/:id",protect,updateTask);

//Delete Route
router.delete("/tasks/:id",protect,deleteTask);

export default router ;