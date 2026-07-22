import * as React from "react"
import * as XLSX from "xlsx"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  getDate,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
  isSameMonth,
  parseISO,
} from "date-fns"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  ListTodo,
  PauseCircle,
  CalendarDays,
  X,
  FileSpreadsheet,
  Timer,
  Folder,
  FileText,
  Tag,
  MessageSquare,
} from "lucide-react"
import { taskApi, projectApi, moduleApi } from "@/services/api"

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    icon: ListTodo,
    badgeClass: "status-todo",
    chipClass: "status-chip status-chip-todo",
    dotColor: "#64748b",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    badgeClass: "status-in-progress",
    chipClass: "status-chip status-chip-in-progress",
    dotColor: "#3b82f6",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass: "status-completed",
    chipClass: "status-chip status-chip-completed",
    dotColor: "#10b981",
  },
  "on-hold": {
    label: "On Hold",
    icon: PauseCircle,
    badgeClass: "status-on-hold",
    chipClass: "status-chip status-chip-on-hold",
    dotColor: "#f59e0b",
  },
}

const STORAGE_KEY = "timeflow_tasks_v2"

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function calcDuration(start, end) {
  if (!start || !end) return "—"
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const mins = eh * 60 + em - (sh * 60 + sm)
  if (mins <= 0) return "—"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}` : `${m}m`
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function saveTasks(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function exportExcel(tasks, date) {
  if (!tasks.length) {
    alert("No tasks to export for this date.")
    return
  }
  const rows = tasks.map((t, i) => ({
    "Sr.": i + 1,
    Date: format(date, "dd/MM/yyyy"),
    "Start Time": t.startTime || "—",
    "End Time": t.endTime || "—",
    Duration: calcDuration(t.startTime, t.endTime),
    Project: t.project || "—",
    "Module / Work Type": t.module || "—",
    "Task Description": t.description || "—",
    Status: STATUS_CONFIG[t.status]?.label || t.status,
    Remarks: t.remarks || "—",
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws["!cols"] = [
    { wch: 5 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 20 }, { wch: 20 }, { wch: 40 }, { wch: 14 }, { wch: 30 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Daily Report")
  XLSX.writeFile(wb, `Daily_Report_${format(date, "dd-MM-yyyy")}.xlsx`)
}

/* ═══════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════ */
function StatCard({ icon: Icon, label, value, sub, cardClass }) {
  return (
    <div className={`stat-card anim-fade-up ${cardClass}`}>
      <div className="stat-icon">
        <Icon size={22} color="#fff" />
      </div>
      <div className="min-w-0">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   OFFICE HOLIDAY HELPER (Sundays, 2nd & 4th Saturdays)
═══════════════════════════════════════════════════════ */
function isOfficeHoliday(date) {
  const dayOfWeek = getDay(date) // 0 = Sun, 6 = Sat
  if (dayOfWeek === 0) {
    return { isHoliday: true, label: "Sunday Office Holiday" }
  }
  if (dayOfWeek === 6) {
    const dayOfMonth = getDate(date)
    // 2nd Saturday: day 8-14
    if (dayOfMonth >= 8 && dayOfMonth <= 14) {
      return { isHoliday: true, label: "2nd Saturday Office Holiday" }
    }
    // 4th Saturday: day 22-28
    if (dayOfMonth >= 22 && dayOfMonth <= 28) {
      return { isHoliday: true, label: "4th Saturday Office Holiday" }
    }
  }
  return { isHoliday: false, label: "" }
}

/* ═══════════════════════════════════════════════════════
   CALENDAR WIDGET
═══════════════════════════════════════════════════════ */
function CalendarWidget({ selectedDate, onSelect, tasksByDate }) {
  const [viewMonth, setViewMonth] = React.useState(selectedDate)

  React.useEffect(() => {
    if (!isSameMonth(selectedDate, viewMonth)) setViewMonth(selectedDate)
  }, [selectedDate])

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  })
  const padStart = getDay(startOfMonth(viewMonth))

  const getDots = (day) => {
    const key = format(day, "yyyy-MM-dd")
    const dayTasks = tasksByDate[key] || []
    const counts = {}
    dayTasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return Object.entries(counts).slice(0, 3).map(([status]) => ({
      color: STATUS_CONFIG[status]?.dotColor || "#64748b",
    }))
  }

  return (
    <div
      className="panel-card flex flex-col h-full"
      style={{ minHeight: 0 }}
    >
      {/* Cal Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <h2 className="font-bold text-base" style={{ color: "var(--color-foreground)" }}>
            {format(viewMonth, "MMMM yyyy")}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Click a date to view tasks
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="cal-prev"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            id="cal-today"
            onClick={() => { setViewMonth(new Date()); onSelect(new Date()) }}
            className="px-3 h-8 rounded-lg text-xs font-semibold transition-all hover:bg-white/10"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Today
          </button>
          <button
            id="cal-next"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 py-3 flex-1 overflow-hidden">
        {/* Weekday labels */}
        <div className="cal-grid mb-1">
          {WEEKDAYS.map((d, idx) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold uppercase py-1"
              style={{ color: idx === 0 || idx === 6 ? "#ec4899" : "#4b5563" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="cal-grid">
          {Array.from({ length: padStart }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            const todayDay = isToday(day)
            const dots = getDots(day)
            const isOtherMonth = !isSameMonth(day, viewMonth)
            const holidayInfo = isOfficeHoliday(day)
            const isHoliday = holidayInfo.isHoliday && !isOtherMonth

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelect(day)}
                title={isHoliday ? holidayInfo.label : undefined}
                className={[
                  "cal-day",
                  todayDay ? "cal-today" : "",
                  isSelected && !todayDay ? "cal-selected" : "",
                  isOtherMonth ? "cal-other-month" : "",
                  isHoliday ? "cal-holiday" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className="cal-num"
                  style={
                    !todayDay && !isSelected && !isHoliday
                      ? { color: isOtherMonth ? "#374151" : "var(--color-foreground)" }
                      : {}
                  }
                >
                  {format(day, "d")}
                </span>
                {dots.length > 0 && (
                  <span className="cal-dots">
                    {dots.map((dot, i) => (
                      <span
                        key={i}
                        className="cal-dot"
                        style={{ background: dot.color }}
                      />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-3.5 flex-wrap px-5 py-3 border-t text-xs font-medium"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Pink Office Holiday Legend */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
          <span className="text-[10px] font-bold text-pink-500">
            Holiday (Sun / 2nd &amp; 4th Sat)
          </span>
        </div>

        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="cal-dot"
              style={{ background: cfg.dotColor }}
            />
            <span className="text-[10px]" style={{ color: "var(--color-muted-foreground)" }}>
              {cfg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   TASK DRAWER  (slides in from right)
═══════════════════════════════════════════════════════ */
const EMPTY_FORM = {
  startTime: "",
  endTime: "",
  project: "",
  module: "",
  description: "",
  status: "todo",
  remarks: "",
}

// Status chips for the drawer
const DRAWER_STATUS = [
  { key: "todo",        label: "To Do",       chipBase: "d-chip-todo",     icon: ListTodo     },
  { key: "in-progress", label: "In Progress", chipBase: "d-chip-progress", icon: Clock        },
  { key: "completed",   label: "Completed",   chipBase: "d-chip-done",     icon: CheckCircle2 },
  { key: "on-hold",     label: "On Hold",     chipBase: "d-chip-hold",     icon: PauseCircle  },
]

function SectionLabel({ children }) {
  return <div className="drawer-section-label">{children}</div>
}

function TaskModal({ open, onClose, editTask, selectedDate, onSave }) {
  const [form, setForm] = React.useState(EMPTY_FORM)
  const [projectsList, setProjectsList] = React.useState([])
  const [modulesList, setModulesList] = React.useState([])

  React.useEffect(() => {
    if (open) {
      setForm(editTask ? { ...editTask } : { ...EMPTY_FORM })

      async function loadMaster() {
        const pRes = await projectApi.fetchProjects()
        const mRes = await moduleApi.fetchModules()
        setProjectsList(pRes.projects || [])
        setModulesList(mRes.modules || [])
      }
      loadMaster()
    }
  }, [open, editTask])

  if (!open) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const dur = calcDuration(form.startTime, form.endTime)

  // Filter modules based on selected project
  const availableModules = modulesList.filter((m) => {
    if (!form.project) return true
    if (!m.projectName) return true
    return m.projectName.toLowerCase() === form.project.toLowerCase()
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.description.trim()) return
    onSave({ ...form, id: editTask?.id || uid(), date: format(selectedDate, "yyyy-MM-dd") })
    onClose()
  }

  return (
    <>
      {/* Dimmed backdrop */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Sliding panel */}
      <div className="drawer-panel">

        {/* ── Gradient Header ── */}
        <div
          className="drawer-header"
          style={{
            background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 55%, #6d28d9 100%)",
            padding: "22px 24px 20px",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: 8,
                }}
              >
                {editTask ? "Edit Task" : "New Task"}
              </span>
              <h2
                style={{
                  fontSize: 22, fontWeight: 900,
                  color: "#fff", lineHeight: 1.2,
                  letterSpacing: "-0.3px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {format(selectedDate, "EEEE")}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                border: "none", cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Live duration badge */}
          {dur !== "\u2014" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
              <Timer size={12} style={{ color: "rgba(255,255,255,0.55)" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Duration:</span>
              <span
                style={{
                  padding: "1px 10px", borderRadius: 999,
                  fontSize: 12, fontWeight: 800,
                  background: "rgba(255,255,255,0.22)",
                  color: "#fff",
                }}
              >
                {dur}
              </span>
            </div>
          )}
        </div>

        {/* ── Scrollable Form ── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div className="drawer-body" style={{ gap: 20, display: "flex", flexDirection: "column" }}>

            {/* TIME */}
            <div>
              <SectionLabel><Clock size={12} className="inline mr-1 text-indigo-500" /> Time</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="field-label">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="drawer-input" />
                </div>
                <div>
                  <label className="field-label">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className="drawer-input" />
                </div>
              </div>
            </div>

            {/* PROJECT & MODULE DROPDOWNS */}
            <div>
              <SectionLabel><Folder size={12} className="inline mr-1 text-indigo-500" /> Project &amp; Module Master</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="field-label">Project Name</label>
                  <select
                    value={form.project}
                    onChange={(e) => {
                      set("project", e.target.value)
                      set("module", "")
                    }}
                    className="drawer-input cursor-pointer"
                  >
                    <option value="">-- Select Project --</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} {p.code ? `(${p.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label">Module / Work Type</label>
                  <select
                    value={form.module}
                    onChange={(e) => set("module", e.target.value)}
                    className="drawer-input cursor-pointer"
                  >
                    <option value="">-- Select Module / Work Type --</option>
                    {availableModules.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <SectionLabel><FileText size={12} className="inline mr-1 text-indigo-500" /> Task Description <span style={{ color: "#ef4444" }}>*</span></SectionLabel>
              <textarea
                rows={4}
                placeholder="What did you work on? Describe clearly…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
                className="drawer-input"
                style={{ resize: "vertical", lineHeight: 1.65, minHeight: 90 }}
              />
            </div>

            {/* STATUS */}
            <div>
              <SectionLabel><Tag size={12} className="inline mr-1 text-indigo-500" /> Status</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DRAWER_STATUS.map(({ key, label, chipBase, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("status", key)}
                    className={`d-chip ${chipBase}${form.status === key ? " d-chip-active" : ""}`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* REMARKS */}
            <div>
              <SectionLabel><MessageSquare size={12} className="inline mr-1 text-indigo-500" /> Remarks</SectionLabel>
              <textarea
                rows={3}
                placeholder="Notes, blockers, dependencies, next steps…"
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
                className="drawer-input"
                style={{ resize: "vertical", lineHeight: 1.65 }}
              />
            </div>

          </div>{/* end drawer-body */}

          {/* ── Footer Buttons ── */}
          <div className="drawer-footer" style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: "11px 0",
                borderRadius: 12, fontSize: 13, fontWeight: 600,
                border: "1.5px solid var(--color-border)",
                color: "var(--color-muted-foreground)",
                background: "transparent", cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2, padding: "11px 0",
                borderRadius: 12, fontSize: 13, fontWeight: 900,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
                transition: "opacity 0.15s",
              }}
            >
              {editTask ? <><Pencil size={14} /> Save Changes</> : <><Plus size={14} /> Add Task</>}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   TASK TABLE / PANEL
═══════════════════════════════════════════════════════ */
function TaskPanel({ selectedDate, tasks, onAdd, onEdit, onDelete, onExport }) {
  const isEmpty = tasks.length === 0

  return (
    <div className="panel-card flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Panel Header */}
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-4 border-b shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} style={{ color: "#6366f1" }} />
          <div>
            <h2 className="font-bold text-sm" style={{ color: "var(--color-foreground)" }}>
              {format(selectedDate, "EEEE, MMMM d")}
            </h2>
            <p className="text-[10px]" style={{ color: "var(--color-muted-foreground)" }}>
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              {tasks.filter((t) => t.status === "completed").length > 0 && (
                <span style={{ color: "#10b981" }}>
                  {" "}· {tasks.filter((t) => t.status === "completed").length} done
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {tasks.length > 0 && (
            <button
              id="export-excel-btn"
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{
                background: "rgba(16,185,129,0.15)",
                color: "#34d399",
                border: "1.5px solid rgba(16,185,129,0.3)",
              }}
            >
              <FileSpreadsheet size={13} />
              Export Excel
            </button>
          )}
          <button
            id="add-task-btn"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            }}
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.1)", border: "1.5px solid rgba(99,102,241,0.2)" }}
            >
              <ListTodo size={28} style={{ color: "#6366f1", opacity: 0.6 }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                No tasks for this day
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                Click "Add Task" to log your work
              </p>
            </div>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Plus size={15} /> Add First Task
            </button>
          </div>
        ) : (
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: `1px solid var(--color-border)`,
                }}
              >
                {["#", "Time", "Project / Module", "Description", "Status", "Remarks", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "#4b5563" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => {
                const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
                const dur = calcDuration(task.startTime, task.endTime)
                return (
                  <tr
                    key={task.id}
                    className="task-row"
                    style={{ borderBottom: `1px solid var(--color-border)` }}
                  >
                    {/* Index */}
                    <td className="px-4 py-3 text-xs" style={{ color: "#4b5563", width: 36 }}>
                      {idx + 1}
                    </td>
                    {/* Time */}
                    <td className="px-4 py-3" style={{ width: 120 }}>
                      {task.startTime ? (
                        <div>
                          <div
                            className="text-xs font-mono font-semibold"
                            style={{ color: "#818cf8" }}
                          >
                            {task.startTime} → {task.endTime || "?"}
                          </div>
                          {dur !== "—" && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Timer size={9} style={{ color: "#4b5563" }} />
                              <span className="text-[10px]" style={{ color: "#4b5563" }}>
                                {dur}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: "#374151" }}>—</span>
                      )}
                    </td>
                    {/* Project */}
                    <td className="px-4 py-3" style={{ width: 160 }}>
                      {task.project && (
                        <div
                          className="text-xs font-semibold"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {task.project}
                        </div>
                      )}
                      {task.module && (
                        <div
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          {task.module}
                        </div>
                      )}
                      {!task.project && !task.module && (
                        <span className="text-xs" style={{ color: "#374151" }}>—</span>
                      )}
                    </td>
                    {/* Description */}
                    <td className="px-4 py-3 max-w-xs">
                      <p
                        className="text-xs line-clamp-2 leading-relaxed"
                        style={{ color: "var(--color-foreground)" }}
                        title={task.description}
                      >
                        {task.description}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3" style={{ width: 120 }}>
                      <span
                        className={`${cfg.badgeClass} inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap`}
                      >
                        <cfg.icon size={9} />
                        {cfg.label}
                      </span>
                    </td>
                    {/* Remarks */}
                    <td className="px-4 py-3 max-w-[140px]">
                      <p
                        className="text-[10px] line-clamp-2"
                        style={{ color: "var(--color-muted-foreground)" }}
                        title={task.remarks}
                      >
                        {task.remarks || "—"}
                      </p>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3" style={{ width: 60 }}>
                      <div className="row-actions flex items-center gap-1">
                        <button
                          onClick={() => onEdit(task)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:bg-indigo-500/20"
                          style={{ color: "#6366f1" }}
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20"
                          style={{ color: "#ef4444" }}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [allTasks, setAllTasks] = React.useState(loadTasks)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editTask, setEditTask] = React.useState(null)
  const [isApiOnline, setIsApiOnline] = React.useState(false)

  // ── Sync with Node.js/Express/MongoDB Backend on Mount ──
  React.useEffect(() => {
    async function syncBackend() {
      const res = await taskApi.fetchTasks()
      if (res.success && Array.isArray(res.tasks)) {
        setIsApiOnline(true)
        const grouped = {}
        res.tasks.forEach((t) => {
          if (!grouped[t.date]) grouped[t.date] = []
          grouped[t.date].push(t)
        })
        setAllTasks(grouped)
      } else {
        setIsApiOnline(false)
      }
    }
    syncBackend()
  }, [])

  // Persist to LocalStorage as backup
  React.useEffect(() => {
    saveTasks(allTasks)
  }, [allTasks])

  const dateKey = format(selectedDate, "yyyy-MM-dd")
  const dayTasks = allTasks[dateKey] || []
  const todayKey = format(new Date(), "yyyy-MM-dd")
  const todayTasks = allTasks[todayKey] || []

  // ── Stats (all-time or today's) ────────────────────────
  const totalToday = todayTasks.length
  const completedToday = todayTasks.filter((t) => t.status === "completed").length
  const inProgressToday = todayTasks.filter((t) => t.status === "in-progress").length
  const pendingToday = todayTasks.filter((t) => t.status === "todo" || t.status === "on-hold").length

  // ── Handlers ───────────────────────────────────────────
  const openAdd = () => { setEditTask(null); setModalOpen(true) }
  const openEdit = (task) => { setEditTask(task); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTask(null) }

  const handleSave = async (task) => {
    const key = task.date
    const existing = allTasks[key] || []
    const isEdit = existing.some((t) => t.id === task.id)

    // 1. Optimistic Local Update
    setAllTasks((prev) => {
      const list = prev[key] || []
      return {
        ...prev,
        [key]: isEdit ? list.map((t) => (t.id === task.id ? task : t)) : [...list, task],
      }
    })

    // 2. Sync to MongoDB API
    if (isEdit) {
      const res = await taskApi.updateTask(task.id, task)
      if (res.success) setIsApiOnline(true)
    } else {
      const res = await taskApi.createTask(task)
      if (res.success && res.task) {
        setIsApiOnline(true)
        const serverTask = res.task
        setAllTasks((prev) => ({
          ...prev,
          [key]: (prev[key] || []).map((t) => (t.id === task.id ? serverTask : t)),
        }))
      }
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return

    // 1. Optimistic Local Delete
    setAllTasks((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter((t) => t.id !== id),
    }))

    // 2. Sync to MongoDB API
    const res = await taskApi.deleteTask(id)
    if (res.success) setIsApiOnline(true)
  }

  const handleExport = () => exportExcel(dayTasks, selectedDate)

  // ── Stats config ────────────────────────────────────────
  const STATS = [
    {
      icon: ListTodo,
      label: "Today's Tasks",
      value: totalToday,
      sub: format(new Date(), "EEE, MMM d"),
      cardClass: "stat-purple",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: completedToday,
      sub: totalToday > 0 ? `${Math.round((completedToday / totalToday) * 100)}% done` : "—",
      cardClass: "stat-green",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: inProgressToday,
      sub: "active tasks",
      cardClass: "stat-cyan",
    },
    {
      icon: PauseCircle,
      label: "Pending",
      value: pendingToday,
      sub: "to do / on hold",
      cardClass: "stat-orange",
    },
  ]

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* ── Page Title ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-black tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            Daily Work Planner
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Track your work, select a date, log tasks and export your daily report.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: "rgba(99,102,241,0.12)",
            color: "#818cf8",
            border: "1.5px solid rgba(99,102,241,0.2)",
          }}
        >
          <CalendarDays size={13} />
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-stagger">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Main Content ───────────────────────────────────── */}
      <div
        className="flex flex-col lg:grid gap-4 flex-1"
        style={{
          gridTemplateColumns: "360px 1fr",
          minHeight: 520,
        }}
      >
        {/* Calendar */}
        <CalendarWidget
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          tasksByDate={allTasks}
        />

        {/* Task Panel */}
        <TaskPanel
          selectedDate={selectedDate}
          tasks={dayTasks}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      </div>

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        onClose={closeModal}
        editTask={editTask}
        selectedDate={selectedDate}
        onSave={handleSave}
      />
    </div>
  )
}
