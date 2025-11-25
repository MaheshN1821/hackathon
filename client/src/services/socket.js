import { io } from "socket.io-client"
import toast from "react-hot-toast"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    })

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id)
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    // Global event listeners
    this.socket.on("newAlert", (alert) => {
      const severity = alert.severity === "critical" ? "error" : alert.severity === "warning" ? "warning" : "info"
      toast[severity === "error" ? "error" : severity === "warning" ? "error" : "success"](alert.title, {
        duration: 5000,
      })
      this.emit("alertReceived", alert)
    })

    this.socket.on("stockUpdate", (data) => {
      this.emit("stockUpdated", data)
    })

    this.socket.on("movementUpdated", (movement) => {
      this.emit("movementChanged", movement)
    })

    this.socket.on("movementStatusChanged", (data) => {
      toast.success(`Movement ${data.movementId} status: ${data.status}`)
      this.emit("movementStatusChanged", data)
    })

    this.socket.on("driverLocationUpdate", (data) => {
      this.emit("driverLocation", data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit("joinUserRoom", userId)
    }
  }

  joinRoleRoom(role) {
    if (this.socket) {
      this.socket.emit("joinRoleRoom", role)
    }
  }

  updateDriverLocation(movementId, coordinates, driverId) {
    if (this.socket) {
      this.socket.emit("updateDriverLocation", { movementId, coordinates, driverId })
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data))
    }
  }
}

export const socketService = new SocketService()
