import User from "../models/User.js"
import { generateToken } from "../utils/generateToken.js"

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "pharmacist",
      phone,
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body

    const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true, runValidators: true })

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json({ success: true, users })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
