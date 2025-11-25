import Movement from "../models/Movement.js"
import Drug from "../models/Drug.js"
import Alert from "../models/Alert.js"

// Generate movement ID
const generateMovementId = () => {
  const prefix = "MOV"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Create movement
export const createMovement = async (req, res) => {
  try {
    const { drugId, quantity, from, to, priority, expectedDelivery, notes, driver } = req.body

    const drug = await Drug.findById(drugId)
    if (!drug) {
      return res.status(404).json({ message: "Drug not found" })
    }

    if (drug.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock for movement" })
    }

    const movement = await Movement.create({
      movementId: generateMovementId(),
      drug: drugId,
      quantity,
      from,
      to,
      priority: priority || "normal",
      expectedDelivery,
      notes,
      driver,
      createdBy: req.user.id,
      scanHistory: [
        {
          location: from,
          scannedAt: new Date(),
          scannedBy: req.user.id,
          notes: "Movement created",
        },
      ],
    })

    await movement.populate([
      { path: "drug", select: "name drugId batchNo" },
      { path: "driver", select: "name email phone" },
      { path: "createdBy", select: "name email" },
    ])

    // Create alert
    await Alert.create({
      type: "movement",
      severity: priority === "urgent" ? "critical" : "info",
      title: `New Movement: ${drug.name}`,
      message: `Movement created from ${from} to ${to}. Quantity: ${quantity}`,
      drug: drugId,
      movement: movement._id,
      targetRoles: ["admin", "warehouse", "driver"],
    })

    const io = req.app.get("io")
    io.emit("movementCreated", movement)

    res.status(201).json({ success: true, movement })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all movements
export const getMovements = async (req, res) => {
  try {
    const { status, priority, from, to, page = 1, limit = 20 } = req.query

    const query = {}
    if (status) query.status = status
    if (priority) query.priority = priority
    if (from) query.from = from
    if (to) query.to = to

    // Filter by driver for driver role
    if (req.user.role === "driver") {
      query.driver = req.user.id
    }

    const movements = await Movement.find(query)
      .populate("drug", "name drugId batchNo qrCode")
      .populate("driver", "name email phone")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .populate("scanHistory.scannedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))

    const total = await Movement.countDocuments(query)

    res.json({
      success: true,
      movements,
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

// Get single movement
export const getMovement = async (req, res) => {
  try {
    const movement = await Movement.findById(req.params.id)
      .populate("drug")
      .populate("driver", "name email phone")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .populate("scanHistory.scannedBy", "name email")

    if (!movement) {
      return res.status(404).json({ message: "Movement not found" })
    }

    res.json({ success: true, movement })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update movement status
export const updateMovementStatus = async (req, res) => {
  try {
    const { status, notes } = req.body
    const movement = await Movement.findById(req.params.id)

    if (!movement) {
      return res.status(404).json({ message: "Movement not found" })
    }

    const oldStatus = movement.status
    movement.status = status

    if (status === "approved") {
      movement.approvedBy = req.user.id

      // Deduct from source inventory
      await Drug.findByIdAndUpdate(movement.drug, {
        $inc: { quantity: -movement.quantity },
      })
    }

    if (status === "delivered") {
      movement.actualDelivery = new Date()

      // Add to destination inventory (or update location)
      const drug = await Drug.findById(movement.drug)
      if (drug) {
        // Check if drug exists at destination, if not create movement record
        drug.location = movement.to
        await drug.save()
      }
    }

    // Add to scan history
    movement.scanHistory.push({
      location: movement.status === "delivered" ? movement.to : movement.from,
      scannedAt: new Date(),
      scannedBy: req.user.id,
      notes: notes || `Status changed from ${oldStatus} to ${status}`,
    })

    await movement.save()
    await movement.populate([
      { path: "drug", select: "name drugId batchNo" },
      { path: "driver", select: "name email phone" },
      { path: "scanHistory.scannedBy", select: "name" },
    ])

    const io = req.app.get("io")
    io.emit("movementUpdated", movement)
    io.emit("movementStatusChanged", {
      movementId: movement.movementId,
      status,
      updatedAt: new Date(),
    })

    res.json({ success: true, movement })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Scan movement (add to scan history)
export const scanMovement = async (req, res) => {
  try {
    const { location, coordinates, notes } = req.body

    const movement = await Movement.findById(req.params.id)

    if (!movement) {
      return res.status(404).json({ message: "Movement not found" })
    }

    movement.scanHistory.push({
      location,
      coordinates,
      scannedAt: new Date(),
      scannedBy: req.user.id,
      notes,
    })

    // Auto update status to in_transit if first scan after approved
    if (movement.status === "approved") {
      movement.status = "in_transit"
    }

    await movement.save()
    await movement.populate([
      { path: "drug", select: "name drugId batchNo" },
      { path: "scanHistory.scannedBy", select: "name" },
    ])

    const io = req.app.get("io")
    io.emit("movementScanned", {
      movementId: movement.movementId,
      location,
      scannedAt: new Date(),
    })

    res.json({ success: true, movement })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Assign driver
export const assignDriver = async (req, res) => {
  try {
    const { driverId, vehicle } = req.body

    const movement = await Movement.findByIdAndUpdate(
      req.params.id,
      { driver: driverId, vehicle },
      { new: true },
    ).populate("driver", "name email phone")

    if (!movement) {
      return res.status(404).json({ message: "Movement not found" })
    }

    const io = req.app.get("io")
    io.to(`user_${driverId}`).emit("movementAssigned", movement)

    res.json({ success: true, movement })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get movement statistics
export const getMovementStats = async (req, res) => {
  try {
    const movements = await Movement.find()

    const stats = {
      total: movements.length,
      pending: movements.filter((m) => m.status === "pending").length,
      approved: movements.filter((m) => m.status === "approved").length,
      inTransit: movements.filter((m) => m.status === "in_transit").length,
      delivered: movements.filter((m) => m.status === "delivered").length,
      cancelled: movements.filter((m) => m.status === "cancelled").length,
      byPriority: {
        urgent: movements.filter((m) => m.priority === "urgent").length,
        high: movements.filter((m) => m.priority === "high").length,
        normal: movements.filter((m) => m.priority === "normal").length,
        low: movements.filter((m) => m.priority === "low").length,
      },
    }

    res.json({ success: true, stats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
