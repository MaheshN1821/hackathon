import cron from "node-cron"
import Drug from "../models/Drug.js"
import Alert from "../models/Alert.js"
import User from "../models/User.js"
import { sendLowStockAlert, sendExpiryAlert } from "../utils/emailService.js"

export const startAlertCronJobs = (io) => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily alert check...")

    try {
      const drugs = await Drug.find({ isActive: true })
      const adminUsers = await User.find({ role: "admin", isActive: true })
      const adminEmails = adminUsers.map((u) => u.email)

      for (const drug of drugs) {
        // Check for low stock
        if (drug.quantity <= drug.minThreshold) {
          const existingAlert = await Alert.findOne({
            drug: drug._id,
            type: "low-stock",
            isResolved: false,
          })

          if (!existingAlert) {
            const alert = await Alert.create({
              type: "low-stock",
              severity: drug.quantity <= 0 ? "critical" : "warning",
              title: `Low Stock: ${drug.name}`,
              message: `${drug.name} (Batch: ${drug.batchNo}) is running low. Current: ${drug.quantity}, Threshold: ${drug.minThreshold}`,
              drug: drug._id,
              targetRoles: ["admin", "warehouse"],
            })

            io.emit("newAlert", alert)
            await sendLowStockAlert(drug, adminEmails)
          }
        }

        // Check for expiry (30 days)
        if (drug.daysUntilExpiry <= 30 && drug.daysUntilExpiry > 0) {
          const existingAlert = await Alert.findOne({
            drug: drug._id,
            type: "expiry",
            isResolved: false,
          })

          if (!existingAlert) {
            const alert = await Alert.create({
              type: "expiry",
              severity: drug.daysUntilExpiry <= 7 ? "critical" : "warning",
              title: `Expiring Soon: ${drug.name}`,
              message: `${drug.name} (Batch: ${drug.batchNo}) expires in ${drug.daysUntilExpiry} days`,
              drug: drug._id,
              targetRoles: ["admin", "warehouse", "pharmacist"],
            })

            io.emit("newAlert", alert)
            await sendExpiryAlert(drug, adminEmails)
          }
        }
      }

      console.log("Alert check completed")
    } catch (error) {
      console.error("Alert cron job error:", error)
    }
  })

  // Also run on startup (for testing)
  console.log("Alert cron jobs scheduled")
}
