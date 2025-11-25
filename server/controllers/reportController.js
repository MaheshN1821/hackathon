import Drug from "../models/Drug.js"
import Movement from "../models/Movement.js"
import Alert from "../models/Alert.js"

// Generate inventory report
export const getInventoryReport = async (req, res) => {
  try {
    const { location, category, startDate, endDate } = req.query

    const query = { isActive: true }
    if (location) query.location = location
    if (category) query.category = category
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const drugs = await Drug.find(query).sort({ name: 1 })

    const report = {
      generatedAt: new Date(),
      filters: { location, category, startDate, endDate },
      summary: {
        totalItems: drugs.length,
        totalQuantity: drugs.reduce((sum, d) => sum + d.quantity, 0),
        totalValue: drugs.reduce((sum, d) => sum + d.quantity * d.price, 0),
        lowStock: drugs.filter((d) => d.stockStatus === "low-stock").length,
        outOfStock: drugs.filter((d) => d.stockStatus === "out-of-stock").length,
        expiringSoon: drugs.filter((d) => d.daysUntilExpiry <= 30 && d.daysUntilExpiry > 0).length,
      },
      items: drugs,
    }

    res.json({ success: true, report })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Generate movement report
export const getMovementReport = async (req, res) => {
  try {
    const { status, from, to, startDate, endDate } = req.query

    const query = {}
    if (status) query.status = status
    if (from) query.from = from
    if (to) query.to = to
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const movements = await Movement.find(query)
      .populate("drug", "name drugId batchNo price")
      .populate("driver", "name")
      .sort({ createdAt: -1 })

    const report = {
      generatedAt: new Date(),
      filters: { status, from, to, startDate, endDate },
      summary: {
        total: movements.length,
        pending: movements.filter((m) => m.status === "pending").length,
        inTransit: movements.filter((m) => m.status === "in_transit").length,
        delivered: movements.filter((m) => m.status === "delivered").length,
        cancelled: movements.filter((m) => m.status === "cancelled").length,
      },
      items: movements,
    }

    res.json({ success: true, report })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Generate expiry report
export const getExpiryReport = async (req, res) => {
  try {
    const { days = 90 } = req.query
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + Number.parseInt(days))

    const drugs = await Drug.find({
      isActive: true,
      expiryDate: { $lte: futureDate },
    }).sort({ expiryDate: 1 })

    const expired = drugs.filter((d) => d.daysUntilExpiry <= 0)
    const critical = drugs.filter((d) => d.daysUntilExpiry > 0 && d.daysUntilExpiry <= 7)
    const warning = drugs.filter((d) => d.daysUntilExpiry > 7 && d.daysUntilExpiry <= 30)
    const upcoming = drugs.filter((d) => d.daysUntilExpiry > 30)

    const report = {
      generatedAt: new Date(),
      daysAhead: Number.parseInt(days),
      summary: {
        total: drugs.length,
        expired: expired.length,
        critical: critical.length,
        warning: warning.length,
        upcoming: upcoming.length,
        totalValueAtRisk: drugs.reduce((sum, d) => sum + d.quantity * d.price, 0),
      },
      categories: { expired, critical, warning, upcoming },
    }

    res.json({ success: true, report })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Generate consumption report
export const getConsumptionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const query = { status: "delivered" }
    if (startDate && endDate) {
      query.actualDelivery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const movements = await Movement.find(query).populate("drug", "name drugId category").sort({ actualDelivery: -1 })

    // Group by drug
    const consumptionByDrug = {}
    movements.forEach((m) => {
      const drugId = m.drug?._id?.toString()
      if (drugId) {
        if (!consumptionByDrug[drugId]) {
          consumptionByDrug[drugId] = {
            drug: m.drug,
            totalQuantity: 0,
            movements: 0,
          }
        }
        consumptionByDrug[drugId].totalQuantity += m.quantity
        consumptionByDrug[drugId].movements++
      }
    })

    const report = {
      generatedAt: new Date(),
      filters: { startDate, endDate },
      summary: {
        totalMovements: movements.length,
        totalQuantityMoved: movements.reduce((sum, m) => sum + m.quantity, 0),
        uniqueDrugs: Object.keys(consumptionByDrug).length,
      },
      consumptionByDrug: Object.values(consumptionByDrug).sort((a, b) => b.totalQuantity - a.totalQuantity),
    }

    res.json({ success: true, report })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [drugs, movements, alerts] = await Promise.all([
      Drug.find({ isActive: true }),
      Movement.find(),
      Alert.find({ isResolved: false }),
    ])

    const stats = {
      inventory: {
        totalDrugs: drugs.length,
        totalQuantity: drugs.reduce((sum, d) => sum + d.quantity, 0),
        totalValue: drugs.reduce((sum, d) => sum + d.quantity * d.price, 0),
        lowStock: drugs.filter((d) => d.stockStatus === "low-stock").length,
        outOfStock: drugs.filter((d) => d.stockStatus === "out-of-stock").length,
        expiringSoon: drugs.filter((d) => d.daysUntilExpiry <= 30 && d.daysUntilExpiry > 0).length,
      },
      movements: {
        total: movements.length,
        pending: movements.filter((m) => m.status === "pending").length,
        inTransit: movements.filter((m) => m.status === "in_transit").length,
        delivered: movements.filter((m) => m.status === "delivered").length,
      },
      alerts: {
        total: alerts.length,
        critical: alerts.filter((a) => a.severity === "critical").length,
        warning: alerts.filter((a) => a.severity === "warning").length,
      },
    }

    res.json({ success: true, stats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
