import express from "express"
import { uploadFile, uploadMultiple, deleteFile } from "../controllers/uploadController.js"
import { upload } from "../config/cloudinary.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.post("/single", upload.single("file"), uploadFile)
router.post("/multiple", upload.array("files", 5), uploadMultiple)
router.delete("/:publicId", deleteFile)

export default router
