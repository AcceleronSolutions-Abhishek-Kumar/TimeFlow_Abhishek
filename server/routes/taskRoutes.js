import express from "express"
import { Task } from "../models/Task.js"

const router = express.Router()

// ── GET /api/tasks (Fetch all tasks or filter by ?date=YYYY-MM-DD) ───────────
router.get("/", async (req, res) => {
  try {
    const { date } = req.query
    const filter = date ? { date } : {}
    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, count: tasks.length, data: tasks })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── GET /api/tasks/:id (Fetch single task) ──────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }
    res.json({ success: true, data: task })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /api/tasks (Create new task) ───────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { date, startTime, endTime, project, module, description, status, remarks } = req.body

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: "Description is required" })
    }
    if (!date) {
      return res.status(400).json({ success: false, error: "Date is required" })
    }

    const newTask = await Task.create({
      date,
      startTime: startTime || "",
      endTime: endTime || "",
      project: project || "",
      module: module || "",
      description: description.trim(),
      status: status || "todo",
      remarks: remarks || "",
    })

    res.status(201).json({ success: true, data: newTask })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── PUT /api/tasks/:id (Update task) ────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedTask) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }

    res.json({ success: true, data: updatedTask })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// ── DELETE /api/tasks/:id (Delete task) ────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }

    res.json({ success: true, message: "Task deleted successfully", data: { id: req.params.id } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
