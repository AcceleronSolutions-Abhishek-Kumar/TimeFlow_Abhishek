import express from "express"
import { Module } from "../models/Module.js"

const router = express.Router()

// ── GET /api/modules (optional ?projectId=xyz) ─────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query
    const filter = projectId ? { projectId } : {}
    const modules = await Module.find(filter).sort({ name: 1 })
    res.json({ success: true, count: modules.length, data: modules })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /api/modules ──────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, projectId, projectName, description } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Module name is required" })
    }

    const newModule = await Module.create({
      name: name.trim(),
      projectId: projectId || null,
      projectName: projectName || "",
      description: (description || "").trim(),
    })

    res.status(201).json({ success: true, data: newModule })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── PUT /api/modules/:id ───────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const updated = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!updated) {
      return res.status(404).json({ success: false, error: "Module not found" })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── DELETE /api/modules/:id ────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Module.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Module not found" })
    }
    res.json({ success: true, data: { id: req.params.id } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
