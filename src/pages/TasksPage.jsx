import * as React from "react"
import { format } from "date-fns"
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ─── Sample Data ──────────────────────────────────────────────────────────────
const INITIAL_TASKS = [
  {
    id: 1,
    title: "Design new landing page wireframes",
    description: "Create low-fidelity wireframes for the redesigned homepage",
    priority: "high",
    status: "todo",
    dueDate: "2026-07-23",
    category: "Design",
    createdAt: "2026-07-20",
  },
  {
    id: 2,
    title: "Fix API authentication bug",
    description: "JWT tokens are expiring prematurely on mobile devices",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-07-22",
    category: "Engineering",
    createdAt: "2026-07-19",
  },
  {
    id: 3,
    title: "Write Q3 project retrospective",
    description: "Summarize lessons learned and team feedback",
    priority: "medium",
    status: "todo",
    dueDate: "2026-07-28",
    category: "Management",
    createdAt: "2026-07-18",
  },
  {
    id: 4,
    title: "Review pull requests for feature/auth-flow",
    description: "Code review for the authentication flow changes",
    priority: "medium",
    status: "done",
    dueDate: "2026-07-21",
    category: "Engineering",
    createdAt: "2026-07-17",
  },
  {
    id: 5,
    title: "Prepare team meeting agenda",
    description: "Set up weekly sync topics and action items",
    priority: "low",
    status: "todo",
    dueDate: "2026-07-22",
    category: "Management",
    createdAt: "2026-07-20",
  },
  {
    id: 6,
    title: "Update project documentation",
    description: "Refresh README and API docs with latest endpoints",
    priority: "low",
    status: "in-progress",
    dueDate: "2026-07-30",
    category: "Engineering",
    createdAt: "2026-07-15",
  },
]

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  high:   { label: "High",   variant: "destructive", icon: AlertCircle, color: "text-red-400" },
  medium: { label: "Medium", variant: "warning",     icon: Flag,        color: "text-amber-400" },
  low:    { label: "Low",    variant: "info",         icon: Flag,        color: "text-blue-400" },
}

const STATUS_CONFIG = {
  todo:        { label: "To Do",       variant: "outline",   icon: Circle },
  "in-progress":{ label: "In Progress", variant: "info",      icon: Clock },
  done:        { label: "Done",        variant: "success",   icon: CheckCircle2 },
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onDelete }) {
  const priority = PRIORITY_CONFIG[task.priority]
  const status   = STATUS_CONFIG[task.status]
  const StatusIcon   = status.icon
  const isDone   = task.status === "done"
  const isOverdue = !isDone && new Date(task.dueDate) < new Date()

  return (
    <TableRow className="group animate-fade-in">
      <TableCell>
        <button
          onClick={() => onToggle(task.id)}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {isDone
            ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            : <Circle className="h-4 w-4" />}
        </button>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className={cn("font-medium text-sm", isDone && "line-through text-muted-foreground")}>
            {task.title}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={priority.variant} className="gap-1">
          <priority.icon className="h-2.5 w-2.5" />
          {priority.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant} className="gap-1 whitespace-nowrap">
          <StatusIcon className="h-2.5 w-2.5" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "text-xs whitespace-nowrap",
            isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"
          )}
        >
          {isOverdue && "⚠ "}
          {format(new Date(task.dueDate), "MMM d, yyyy")}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">{task.category}</span>
      </TableCell>
      <TableCell>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </TableCell>
    </TableRow>
  )
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({ onAdd }) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    category: "Engineering",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd({
      ...form,
      id: Date.now(),
      status: "todo",
      createdAt: format(new Date(), "yyyy-MM-dd"),
    })
    setForm({ title: "", description: "", priority: "medium", dueDate: format(new Date(), "yyyy-MM-dd"), category: "Engineering" })
    setOpen(false)
  }

  const field = (label, children) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )

  const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="add-task-btn" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your board. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {field("Title *",
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          )}
          {field("Description",
            <textarea
              id="task-desc"
              placeholder="Optional description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            {field("Priority",
              <select
                id="task-priority"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className={selectClass}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            )}
            {field("Category",
              <select
                id="task-category"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={selectClass}
              >
                <option>Engineering</option>
                <option>Design</option>
                <option>Management</option>
                <option>Marketing</option>
                <option>Research</option>
              </select>
            )}
          </div>
          {field("Due Date",
            <Input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            />
          )}
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Tasks Page ───────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = React.useState(INITIAL_TASKS)
  const [search, setSearch] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState("all")
  const [filterPriority, setFilterPriority] = React.useState("all")

  const todo     = tasks.filter(t => t.status === "todo").length
  const progress = tasks.filter(t => t.status === "in-progress").length
  const done     = tasks.filter(t => t.status === "done").length

  const filtered = tasks.filter(t => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus   = filterStatus   === "all" || t.status   === filterStatus
    const matchPriority = filterPriority === "all" || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const handleToggle = (id) => {
    setTasks(ts => ts.map(t =>
      t.id === id
        ? { ...t, status: t.status === "done" ? "todo" : "done" }
        : t
    ))
  }

  const handleDelete = (id) => {
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  const handleAdd = (task) => {
    setTasks(ts => [task, ...ts])
  }

  const selectClass = "h-8 rounded-md border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Manage your to-dos and track project progress.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "To Do",       value: todo,     color: "text-foreground",  bg: "bg-secondary/50" },
          { label: "In Progress", value: progress, color: "text-blue-400",    bg: "bg-blue-500/10"  },
          { label: "Completed",   value: done,     color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(s => (
          <div key={s.label} className={cn("glass-card p-4 flex items-center gap-3", s.bg)}>
            <span className={cn("text-3xl font-bold", s.color)}>{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="tasks-search"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={selectClass}
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            id="filter-priority"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className={selectClass}
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="ml-auto">
            <AddTaskModal onAdd={handleAdd} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-32">Due Date</TableHead>
              <TableHead className="w-28">Category</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 opacity-30" />
                    <span>No tasks found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {tasks.length} tasks
      </p>
    </div>
  )
}
