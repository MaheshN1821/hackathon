import mongoose from "mongoose"

const scanHistorySchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notes: String,
})

const movementSchema = new mongoose.Schema(
  {
    movementId: {
      type: String,
      required: true,
      unique: true,
    },
    drug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drug",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    vehicle: {
      type: String,
      default: "",
    },
    expectedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },
    scanHistory: [scanHistorySchema],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

export default mongoose.model("Movement", movementSchema)
