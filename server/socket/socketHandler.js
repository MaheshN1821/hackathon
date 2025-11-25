export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Join user-specific room for targeted notifications
    socket.on("joinUserRoom", (userId) => {
      socket.join(`user_${userId}`)
      console.log(`User ${userId} joined their room`)
    })

    // Join role-based rooms
    socket.on("joinRoleRoom", (role) => {
      socket.join(`role_${role}`)
      console.log(`Socket joined role room: ${role}`)
    })

    // Leave rooms
    socket.on("leaveRoom", (room) => {
      socket.leave(room)
    })

    // Track driver location
    socket.on("updateDriverLocation", (data) => {
      const { movementId, coordinates, driverId } = data
      io.emit("driverLocationUpdate", { movementId, coordinates, driverId })
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })
}
