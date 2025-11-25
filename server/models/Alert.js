import mongoose from "mongoose"

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["low-stock", "expiry", "delivery-delay", "reorder", "movement", "system"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    drug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drug",
    },
    movement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movement",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetRoles: [
      {
        type: String,
        enum: ["admin", "warehouse", "pharmacist", "driver"],
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model("Alert", alertSchema)
