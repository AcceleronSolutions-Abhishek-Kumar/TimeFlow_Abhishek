import express from "express"
import { Project } from "../models/Project.js"

const router = express.Router()

// ── GET /api/projects ──────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ name: 1 })
    res.json({ success: true, count: projects.length, data: projects })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /api/projects ─────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, code, description, status } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Project name is required" })
    }

    const existing = await Project.findOne({ name: new RegExp(`^${name.trim()}$`, "i") })
    if (existing) {
      return res.status(400).json({ success: false, error: "Project with this name already exists" })
    }

    const newProject = await Project.create({
      name: name.trim(),
      code: (code || "").trim(),
      description: (description || "").trim(),
      status: status || "active",
    })

    res.status(201).json({ success: true, data: newProject })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── PUT /api/projects/:id ──────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!updated) {
      return res.status(404).json({ success: false, error: "Project not found" })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── DELETE /api/projects/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Project not found" })
    }
    res.json({ success: true, data: { id: req.params.id } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
