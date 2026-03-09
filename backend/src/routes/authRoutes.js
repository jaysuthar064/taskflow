import express from "express";
import { loginUser, registerUser} from "../controllers/authControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Post Route
router.post("/register",registerUser);
router.post("/login",loginUser );

router.get("/profile",protect,(req,res)=>{
    res.json({
        message:`Protected route accessed`,
        user:req.user
    });
});

export default router;