import express from "express"
import {
  getAlerts,
  markAsRead,
  markAllAsRead,
  resolveAlert,
  getExpiryAlerts,
  getLowStockAlerts,
  createAlert,
} from "../controllers/alertController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.route("/").get(getAlerts).post(authorize("admin"), createAlert)

router.get("/expiry", getExpiryAlerts)
router.get("/low-stock", getLowStockAlerts)
router.put("/read-all", markAllAsRead)
router.put("/:id/read", markAsRead)
router.put("/:id/resolve", authorize("admin", "warehouse"), resolveAlert)

export default router
