import Drug from "../models/Drug.js"
import Alert from "../models/Alert.js"
import { generateQRCode } from "../utils/generateQR.js"

// Generate unique drug ID
const generateDrugId = () => {
  const prefix = "DRG"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Create drug
export const createDrug = async (req, res) => {
  try {
    const drugId = generateDrugId()

    const drugData = {
      ...req.body,
      drugId,
      createdBy: req.user.id,
    }

    // Generate QR Code
    const qrData = {
      drugId,
      name: drugData.name,
      batchNo: drugData.batchNo,
      expiryDate: drugData.expiryDate,
      location: drugData.location,
    }
    drugData.qrCode = await generateQRCode(qrData)

    const drug = await Drug.create(drugData)

    // Emit socket event for real-time update
    const io = req.app.get("io")
    io.emit("drugCreated", drug)

    res.status(201).json({ success: true, drug })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all drugs
export const getDrugs = async (req, res) => {
  try {
    const { category, location, status, search, sortBy = "createdAt", order = "desc", page = 1, limit = 20 } = req.query

    const query = { isActive: true }

    if (category) query.category = category
    if (location) query.location = location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { drugId: { $regex: search, $options: "i" } },
        { batchNo: { $regex: search, $options: "i" } },
      ]
    }

    const drugs = await Drug.find(query)
      .populate("createdBy", "name email")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))

    // Filter by stock status if provided
    let filteredDrugs = drugs
    if (status) {
      filteredDrugs = drugs.filter((drug) => drug.stockStatus === status)
    }

    const total = await Drug.countDocuments(query)

    res.json({
      success: true,
      drugs: filteredDrugs,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get single drug
export const getDrug = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id).populate("createdBy", "name email")

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" })
    }

    res.json({ success: true, drug })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update drug
export const updateDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" })
    }

    // Check for low stock and create alert
    if (drug.quantity <= drug.minThreshold) {
      await Alert.create({
        type: "low-stock",
        severity: drug.quantity <= 0 ? "critical" : "warning",
        title: `Low Stock: ${drug.name}`,
        message: `${drug.name} (Batch: ${drug.batchNo}) is running low. Current: ${drug.quantity}, Threshold: ${drug.minThreshold}`,
        drug: drug._id,
        targetRoles: ["admin", "warehouse"],
      })
    }

    // Emit socket event
    const io = req.app.get("io")
    io.emit("drugUpdated", drug)
    io.emit("stockUpdate", { drugId: drug.drugId, quantity: drug.quantity, stockStatus: drug.stockStatus })

    res.json({ success: true, drug })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete drug (soft delete)
export const deleteDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" })
    }

    const io = req.app.get("io")
    io.emit("drugDeleted", drug._id)

    res.json({ success: true, message: "Drug deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get drug by QR code data
export const getDrugByQR = async (req, res) => {
  try {
    const { drugId, batchNo } = req.body

    const drug = await Drug.findOne({ drugId, batchNo, isActive: true })

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" })
    }

    res.json({ success: true, drug })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get inventory statistics
export const getInventoryStats = async (req, res) => {
  try {
    const drugs = await Drug.find({ isActive: true })

    const stats = {
      totalDrugs: drugs.length,
      totalQuantity: drugs.reduce((sum, d) => sum + d.quantity, 0),
      totalValue: drugs.reduce((sum, d) => sum + d.quantity * d.price, 0),
      lowStock: drugs.filter((d) => d.stockStatus === "low-stock").length,
      outOfStock: drugs.filter((d) => d.stockStatus === "out-of-stock").length,
      expiringSoon: drugs.filter((d) => d.daysUntilExpiry <= 30 && d.daysUntilExpiry > 0).length,
      expired: drugs.filter((d) => d.daysUntilExpiry <= 0).length,
      byCategory: {},
      byLocation: {},
    }

    // Group by category
    drugs.forEach((drug) => {
      if (!stats.byCategory[drug.category]) {
        stats.byCategory[drug.category] = { count: 0, quantity: 0 }
      }
      stats.byCategory[drug.category].count++
      stats.byCategory[drug.category].quantity += drug.quantity
    })

    // Group by location
    drugs.forEach((drug) => {
      if (!stats.byLocation[drug.location]) {
        stats.byLocation[drug.location] = { count: 0, quantity: 0 }
      }
      stats.byLocation[drug.location].count++
      stats.byLocation[drug.location].quantity += drug.quantity
    })

    res.json({ success: true, stats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Regenerate QR Code
export const regenerateQR = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id)

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" })
    }

    const qrData = {
      drugId: drug.drugId,
      name: drug.name,
      batchNo: drug.batchNo,
      expiryDate: drug.expiryDate,
      location: drug.location,
    }

    drug.qrCode = await generateQRCode(qrData)
    await drug.save()

    res.json({ success: true, qrCode: drug.qrCode })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
