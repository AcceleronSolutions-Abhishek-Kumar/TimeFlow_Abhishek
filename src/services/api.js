const API_BASE = "http://localhost:5000/api"

// Default initial Master data for offline fallback
const DEFAULT_PROJECTS = [
  { id: "p1", name: "TimeFlow App", code: "TFA", description: "Time & Task Planner", status: "active" },
  { id: "p2", name: "Client Website", code: "CWEB", description: "Corporate Web Portal", status: "active" },
  { id: "p3", name: "Shyam Steel Audit", code: "SSA", description: "Audit & Reporting Portal", status: "active" },
]

const DEFAULT_MODULES = [
  { id: "m1", name: "Frontend Development", projectId: "p1", projectName: "TimeFlow App", description: "React UI Components" },
  { id: "m2", name: "Backend API", projectId: "p1", projectName: "TimeFlow App", description: "Node Express Endpoints" },
  { id: "m3", name: "Bug Fix & QA", projectId: "p1", projectName: "TimeFlow App", description: "Testing & Repairs" },
  { id: "m4", name: "Import Audit Api", projectId: "p3", projectName: "Shyam Steel Audit", description: "Data Import Engine" },
]

const DEFAULT_USERS = [
  { id: "u1", name: "Abhishek Admin", email: "admin@timeflow.com", password: "password123", role: "admin", status: "active" },
  { id: "u2", name: "Rahul Staff", email: "user@timeflow.com", password: "password123", role: "user", status: "active" },
]

// Global toast notifier registry
let toastListener = null

export function registerToastListener(callback) {
  toastListener = callback
}

function notifyToast(message, type = "success") {
  if (toastListener) {
    toastListener(message, type)
  }
}

function getLocal(key, defaultData) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultData
  } catch {
    return defaultData
  }
}

function setLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

/**
 * Authentication API Service
 */
export const authApi = {
  async login(identifier, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, email: identifier, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      notifyToast("Logged in successfully!", "success")
      return { success: true, user: data.user, token: data.token }
    } catch (err) {
      // Local fallback for testing demo accounts when offline
      const users = getLocal("tmt_users_master", DEFAULT_USERS)
      const query = (identifier || "").toLowerCase().trim()
      const found = users.find(
        (u) =>
          (u.email.toLowerCase() === query || u.name.toLowerCase() === query) &&
          u.password === password
      )
      if (found) {
        if (found.status === "inactive") {
          notifyToast("Account is inactive. Contact Administrator.", "error")
          return { success: false, error: "Account is inactive. Contact Administrator." }
        }
        notifyToast("Logged in successfully! (Local Mode)", "success")
        return { success: true, user: found, token: `local_token_${found.id}` }
      }
      notifyToast(err.message || "Invalid Email/Name or Password", "error")
      return { success: false, error: err.message || "Invalid Email/Name or Password" }
    }
  },
}

/**
 * User Management API Service (Admin Only)
 */
export const userApi = {
  async fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/users`)
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      const users = data.data || []
      setLocal("tmt_users_master", users)
      return { success: true, users }
    } catch (err) {
      const local = getLocal("tmt_users_master", DEFAULT_USERS)
      return { success: false, users: local, error: err.message }
    }
  },

  async createUser(userData) {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create user")
      notifyToast("User created successfully!", "success")
      return { success: true, user: data.data }
    } catch (err) {
      const local = getLocal("tmt_users_master", DEFAULT_USERS)
      const newU = { ...userData, id: `u_${Date.now()}` }
      const updated = [...local, newU]
      setLocal("tmt_users_master", updated)
      notifyToast("User created successfully! (Offline Mode)", "success")
      return { success: true, user: newU, isOffline: true }
    }
  },

  async updateUser(id, userData) {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update user")
      notifyToast("User updated successfully!", "success")
      return { success: true, user: data.data }
    } catch (err) {
      const local = getLocal("tmt_users_master", DEFAULT_USERS)
      const updated = local.map((u) => (u.id === id ? { ...u, ...userData } : u))
      setLocal("tmt_users_master", updated)
      notifyToast("User updated successfully! (Offline Mode)", "success")
      return { success: true, user: { id, ...userData }, isOffline: true }
    }
  },

  async deleteUser(id) {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete user")
      const data = await res.json()
      notifyToast("User deleted successfully!", "success")
      return { success: true, data: data.data }
    } catch (err) {
      const local = getLocal("tmt_users_master", DEFAULT_USERS)
      const updated = local.filter((u) => u.id !== id)
      setLocal("tmt_users_master", updated)
      notifyToast("User deleted successfully! (Offline Mode)", "success")
      return { success: true, isOffline: true }
    }
  },
}

/**
 * Task API Service
 */
export const taskApi = {
  async fetchTasks(dateKey = null) {
    try {
      const url = dateKey ? `${API_BASE}/tasks?date=${dateKey}` : `${API_BASE}/tasks`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Network error")
      const data = await res.json()
      return { success: true, tasks: data.data || [] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  async createTask(taskData) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to create task")
      }
      const data = await res.json()
      notifyToast("Task created successfully!", "success")
      return { success: true, task: data.data }
    } catch (err) {
      notifyToast(`Failed to create task: ${err.message}`, "error")
      return { success: false, error: err.message }
    }
  },

  async updateTask(id, taskData) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to update task")
      }
      const data = await res.json()
      notifyToast("Task updated successfully!", "success")
      return { success: true, task: data.data }
    } catch (err) {
      notifyToast(`Failed to update task: ${err.message}`, "error")
      return { success: false, error: err.message }
    }
  },

  async deleteTask(id) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to delete task")
      }
      const data = await res.json()
      notifyToast("Task deleted successfully!", "success")
      return { success: true, data: data.data }
    } catch (err) {
      notifyToast(`Failed to delete task: ${err.message}`, "error")
      return { success: false, error: err.message }
    }
  },
}

/**
 * Project Master API Service
 */
export const projectApi = {
  async fetchProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`)
      if (!res.ok) throw new Error("Network error")
      const data = await res.json()
      const projects = data.data || []
      setLocal("tmt_master_projects", projects)
      return { success: true, projects }
    } catch (err) {
      const localProjects = getLocal("tmt_master_projects", DEFAULT_PROJECTS)
      return { success: false, projects: localProjects, error: err.message }
    }
  },

  async createProject(projectData) {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create project")
      notifyToast("Project created successfully!", "success")
      return { success: true, project: data.data }
    } catch (err) {
      const local = getLocal("tmt_master_projects", DEFAULT_PROJECTS)
      const newP = { ...projectData, id: `p_${Date.now()}` }
      const updated = [...local, newP]
      setLocal("tmt_master_projects", updated)
      notifyToast("Project created successfully! (Offline Mode)", "success")
      return { success: true, project: newP, isOffline: true }
    }
  },

  async updateProject(id, projectData) {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update project")
      notifyToast("Project updated successfully!", "success")
      return { success: true, project: data.data }
    } catch (err) {
      const local = getLocal("tmt_master_projects", DEFAULT_PROJECTS)
      const updated = local.map((p) => (p.id === id ? { ...p, ...projectData } : p))
      setLocal("tmt_master_projects", updated)
      notifyToast("Project updated successfully! (Offline Mode)", "success")
      return { success: true, project: { id, ...projectData }, isOffline: true }
    }
  },

  async deleteProject(id) {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete project")
      const data = await res.json()
      notifyToast("Project deleted successfully!", "success")
      return { success: true, data: data.data }
    } catch (err) {
      const local = getLocal("tmt_master_projects", DEFAULT_PROJECTS)
      const updated = local.filter((p) => p.id !== id)
      setLocal("tmt_master_projects", updated)
      notifyToast("Project deleted successfully! (Offline Mode)", "success")
      return { success: true, isOffline: true }
    }
  },
}

/**
 * Module Master API Service
 */
export const moduleApi = {
  async fetchModules(projectId = null) {
    try {
      const url = projectId ? `${API_BASE}/modules?projectId=${projectId}` : `${API_BASE}/modules`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Network error")
      const data = await res.json()
      const modules = data.data || []
      setLocal("tmt_master_modules", modules)
      return { success: true, modules }
    } catch (err) {
      const local = getLocal("tmt_master_modules", DEFAULT_MODULES)
      const filtered = projectId ? local.filter((m) => m.projectId === projectId) : local
      return { success: false, modules: filtered, error: err.message }
    }
  },

  async createModule(moduleData) {
    try {
      const res = await fetch(`${API_BASE}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create module")
      notifyToast("Module created successfully!", "success")
      return { success: true, module: data.data }
    } catch (err) {
      const local = getLocal("tmt_master_modules", DEFAULT_MODULES)
      const newM = { ...moduleData, id: `m_${Date.now()}` }
      const updated = [...local, newM]
      setLocal("tmt_master_modules", updated)
      notifyToast("Module created successfully! (Offline Mode)", "success")
      return { success: true, module: newM, isOffline: true }
    }
  },

  async updateModule(id, moduleData) {
    try {
      const res = await fetch(`${API_BASE}/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update module")
      notifyToast("Module updated successfully!", "success")
      return { success: true, module: data.data }
    } catch (err) {
      const local = getLocal("tmt_master_modules", DEFAULT_MODULES)
      const updated = local.map((m) => (m.id === id ? { ...m, ...moduleData } : m))
      setLocal("tmt_master_modules", updated)
      notifyToast("Module updated successfully! (Offline Mode)", "success")
      return { success: true, module: { id, ...moduleData }, isOffline: true }
    }
  },

  async deleteModule(id) {
    try {
      const res = await fetch(`${API_BASE}/modules/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete module")
      const data = await res.json()
      notifyToast("Module deleted successfully!", "success")
      return { success: true, data: data.data }
    } catch (err) {
      const local = getLocal("tmt_master_modules", DEFAULT_MODULES)
      const updated = local.filter((m) => m.id !== id)
      setLocal("tmt_master_modules", updated)
      notifyToast("Module deleted successfully! (Offline Mode)", "success")
      return { success: true, isOffline: true }
    }
  },
}
