import express from "express"
import {
  createMovement,
  getMovements,
  getMovement,
  updateMovementStatus,
  scanMovement,
  assignDriver,
  getMovementStats,
} from "../controllers/movementController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.route("/").get(getMovements).post(authorize("admin", "warehouse"), createMovement)

router.get("/stats", getMovementStats)

router.route("/:id").get(getMovement)

router.put("/:id/status", authorize("admin", "warehouse", "driver"), updateMovementStatus)
router.put("/:id/scan", scanMovement)
router.put("/:id/assign-driver", authorize("admin", "warehouse"), assignDriver)

export default router
