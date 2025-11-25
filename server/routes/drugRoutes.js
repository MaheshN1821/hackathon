import express from "express"
import {
  createDrug,
  getDrugs,
  getDrug,
  updateDrug,
  deleteDrug,
  getDrugByQR,
  getInventoryStats,
  regenerateQR,
} from "../controllers/drugController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.route("/").get(getDrugs).post(authorize("admin", "warehouse"), createDrug)

router.get("/stats", getInventoryStats)
router.post("/scan", getDrugByQR)

router
  .route("/:id")
  .get(getDrug)
  .put(authorize("admin", "warehouse"), updateDrug)
  .delete(authorize("admin"), deleteDrug)

router.post("/:id/regenerate-qr", authorize("admin", "warehouse"), regenerateQR)

export default router
