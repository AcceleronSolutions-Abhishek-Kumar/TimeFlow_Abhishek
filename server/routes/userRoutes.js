import express from "express"
import { User } from "../models/User.js"

const router = express.Router()

// ── GET /api/users (List all users) ────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ success: true, count: users.length, data: users })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /api/users (Admin Create User) ───────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, Email, and Password are required" })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(400).json({ success: false, error: "User with this email already exists" })
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "user",
      status: status || "active",
    })

    res.status(201).json({ success: true, data: newUser.toJSON() })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── PUT /api/users/:id (Admin Update User) ────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body
    if (password && password.trim()) {
      updateData.password = password.trim()
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({ success: true, data: updatedUser.toJSON() })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── DELETE /api/users/:id (Admin Delete User) ─────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)

    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({ success: true, data: { id: req.params.id } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
