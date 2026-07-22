import express from "express"
import { User } from "../models/User.js"

const router = express.Router()

// Pre-seed default Admin & User if DB is empty
async function seedDefaultUsers() {
  try {
    const count = await User.countDocuments()
    if (count === 0) {
      await User.create([
        {
          name: "Abhishek Admin",
          email: "admin@timeflow.com",
          password: "password123",
          role: "admin",
          status: "active",
        },
        {
          name: "Rahul Staff",
          email: "user@timeflow.com",
          password: "password123",
          role: "user",
          status: "active",
        },
      ])
      console.log("🌱 Default Admin (admin@timeflow.com) & User (user@timeflow.com) created.")
    }
  } catch (err) {
    console.error("Seed error:", err.message)
  }
}
seedDefaultUsers()

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password } = req.body
    const loginValue = (identifier || email || "").trim()

    if (!loginValue || !password) {
      return res.status(400).json({ success: false, error: "Please enter Email/Name and Password" })
    }

    // Find user by email OR name (case insensitive regex match for name)
    const user = await User.findOne({
      $or: [
        { email: loginValue.toLowerCase() },
        { name: new RegExp(`^${loginValue}$`, "i") },
      ],
    })

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid Email/Name or User does not exist" })
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid Password" })
    }

    if (user.status === "inactive") {
      return res.status(403).json({ success: false, error: "Account is inactive. Contact Administrator." })
    }

    const userData = user.toJSON()
    const token = `token_${user._id}_${Date.now()}`

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /api/auth/register ────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, Email and Password are required" })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(400).json({ success: false, error: "Email is already registered" })
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "user",
      status: "active",
    })

    const userData = newUser.toJSON()
    const token = `token_${newUser._id}_${Date.now()}`

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: userData,
    })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
