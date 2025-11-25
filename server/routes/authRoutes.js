import express from "express"
import { register, login, getMe, updateProfile, getUsers } from "../controllers/authController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", protect, getMe)
router.put("/profile", protect, updateProfile)
router.get("/users", protect, authorize("admin"), getUsers)

export default router
