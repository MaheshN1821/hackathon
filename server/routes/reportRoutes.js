import express from "express"
import {
  getInventoryReport,
  getMovementReport,
  getExpiryReport,
  getConsumptionReport,
  getDashboardStats,
} from "../controllers/reportController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.get("/dashboard", getDashboardStats)
router.get("/inventory", authorize("admin", "warehouse", "pharmacist"), getInventoryReport)
router.get("/movement", authorize("admin", "warehouse"), getMovementReport)
router.get("/expiry", authorize("admin", "warehouse", "pharmacist"), getExpiryReport)
router.get("/consumption", authorize("admin"), getConsumptionReport)

export default router
