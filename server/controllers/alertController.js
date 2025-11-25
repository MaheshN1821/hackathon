import Alert from "../models/Alert.js"
import Drug from "../models/Drug.js"

// Get alerts for user
export const getAlerts = async (req, res) => {
  try {
    const { type, severity, isRead, page = 1, limit = 20 } = req.query

    const query = {
      targetRoles: req.user.role,
    }

    if (type) query.type = type
    if (severity) query.severity = severity
    if (isRead !== undefined) query.isRead = isRead === "true"

    const alerts = await Alert.find(query)
      .populate("drug", "name drugId batchNo")
      .populate("movement", "movementId from to status")
      .populate("resolvedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))

    const total = await Alert.countDocuments(query)
    const unreadCount = await Alert.countDocuments({ ...query, isRead: false })

    res.json({
      success: true,
      alerts,
      unreadCount,
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

// Mark alert as read
export const markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" })
    }

    res.json({ success: true, alert })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mark all alerts as read
export const markAllAsRead = async (req, res) => {
  try {
    await Alert.updateMany({ targetRoles: req.user.role, isRead: false }, { isRead: true })

    res.json({ success: true, message: "All alerts marked as read" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Resolve alert
export const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user.id,
      },
      { new: true },
    )

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" })
    }

    res.json({ success: true, alert })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get expiring drugs alerts
export const getExpiryAlerts = async (req, res) => {
  try {
    const { days = 30 } = req.query
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + Number.parseInt(days))

    const expiringDrugs = await Drug.find({
      isActive: true,
      expiryDate: { $lte: futureDate, $gte: new Date() },
    }).sort({ expiryDate: 1 })

    res.json({ success: true, drugs: expiringDrugs })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get low stock alerts
export const getLowStockAlerts = async (req, res) => {
  try {
    const drugs = await Drug.find({ isActive: true })
    const lowStockDrugs = drugs.filter((d) => d.quantity <= d.minThreshold)

    res.json({ success: true, drugs: lowStockDrugs })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create manual alert
export const createAlert = async (req, res) => {
  try {
    const alert = await Alert.create({
      ...req.body,
      targetRoles: req.body.targetRoles || ["admin"],
    })

    const io = req.app.get("io")
    io.emit("newAlert", alert)

    res.status(201).json({ success: true, alert })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
