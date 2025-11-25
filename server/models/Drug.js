import mongoose from "mongoose"

const drugSchema = new mongoose.Schema(
  {
    drugId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Drug name is required"],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "antibiotics",
        "painkillers",
        "cardiovascular",
        "respiratory",
        "diabetes",
        "vitamins",
        "vaccines",
        "emergency",
        "other",
      ],
      default: "other",
    },
    batchNo: {
      type: String,
      required: [true, "Batch number is required"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["tablets", "capsules", "vials", "bottles", "boxes", "strips"],
      default: "tablets",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    manufactureDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      enum: ["central-warehouse", "city-hospital", "district-pharmacy", "mobile-unit"],
      default: "central-warehouse",
    },
    minThreshold: {
      type: Number,
      default: 50,
    },
    maxThreshold: {
      type: Number,
      default: 1000,
    },
    qrCode: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    storageCondition: {
      type: String,
      enum: ["room-temperature", "refrigerated", "frozen", "controlled"],
      default: "room-temperature",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

// Virtual for days until expiry
drugSchema.virtual("daysUntilExpiry").get(function () {
  const today = new Date()
  const expiry = new Date(this.expiryDate)
  const diffTime = expiry - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for stock status
drugSchema.virtual("stockStatus").get(function () {
  if (this.quantity <= 0) return "out-of-stock"
  if (this.quantity <= this.minThreshold) return "low-stock"
  if (this.quantity >= this.maxThreshold) return "overstocked"
  return "in-stock"
})

drugSchema.set("toJSON", { virtuals: true })
drugSchema.set("toObject", { virtuals: true })

export default mongoose.model("Drug", drugSchema)
