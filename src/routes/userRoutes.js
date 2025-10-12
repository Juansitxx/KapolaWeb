import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateUser } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", validateUser, registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);

export default router;    