import express from "express";
import { deleteTask, getSingleTask, getTask, loginUser, registerUser, taskCreate, updateTask} from "../controllers/authControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Post Route
router.post("/register",registerUser);
router.post("/login",loginUser );
router.post("/tasks",protect,taskCreate);

router.get("/profile",protect,(req,res)=>{
    res.json({
        message:`Protected route accessed`,
        user:req.user
    });
});

//Get Route
router.get("/tasks",protect,getTask);
router.get("/tasks/:id",protect,getSingleTask);

//Patch Route
router.patch("/tasks/:id",protect,updateTask);

//Delete Route
router.delete("/tasks/:id",protect,deleteTask)

export default router;