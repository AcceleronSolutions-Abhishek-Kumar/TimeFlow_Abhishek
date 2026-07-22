import * as React from "react"
import { Users, Plus, Pencil, Trash2, Search, ShieldCheck, User as UserIcon, X, CheckCircle2 } from "lucide-react"
import { userApi } from "@/services/api"
import { useAuth } from "@/context/AuthContext"
import ConfirmModal from "@/components/ConfirmModal"

export default function UsersPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = React.useState([])
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  // Modal states
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState(null)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
  })

  // Load Users
  const loadUsersList = React.useCallback(async () => {
    setLoading(true)
    const res = await userApi.fetchUsers()
    setUsers(res.users || [])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadUsersList()
  }, [loadUsersList])

  // Handlers
  const openAdd = () => {
    setEditUser(null)
    setForm({ name: "", email: "", password: "", role: "user", status: "active" })
    setModalOpen(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({ name: u.name, email: u.email, password: "", role: u.role || "user", status: u.status || "active" })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return

    if (editUser) {
      await userApi.updateUser(editUser.id, form)
    } else {
      if (!form.password) {
        alert("Password is required for new user")
        return
      }
      await userApi.createUser(form)
    }

    setModalOpen(false)
    loadUsersList()
  }

  const [deleteTargetId, setDeleteTargetId] = React.useState(null)

  const askDelete = (id) => {
    setDeleteTargetId(id)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    const id = deleteTargetId
    setDeleteTargetId(null)
    await userApi.deleteUser(id)
    loadUsersList()
  }

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <h2 className="text-lg font-bold text-red-400">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1">User Management requires Admin privileges.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--color-foreground)" }}>
            User Management
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Admin portal to manage system users, roles, and access credentials.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
        >
          <Plus size={15} /> Add New User
        </button>
      </div>

      {/* ── Search Bar ────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="drawer-input h-9 text-xs"
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {/* ── Users Table ───────────────────────────────────────── */}
      <div className="panel-card flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-border)", color: "#64748b" }}>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">#</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">User</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500">
                  No users found. Click "Add New User" to create one.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, idx) => (
                <tr key={u.id} className="task-row hover:bg-slate-100/60 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--color-foreground)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-slate-900 dark:text-slate-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        u.role === "admin"
                          ? "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                          : "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                      }`}
                    >
                      {u.role === "admin" ? <ShieldCheck size={11} /> : <UserIcon size={11} />}
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        u.status === "active"
                          ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                          : "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30"
                      }`}
                    >
                      {u.status || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(u)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15 transition-all"
                        title="Edit User"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => askDelete(u.id)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-500/15 transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── USER DRAWER MODAL ─────────────────────────────────── */}
      {modalOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setModalOpen(false)} />
          <div className="drawer-panel">
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
                    User Account Setup
                  </span>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                    {editUser ? "Edit User" : "Add New User"}
                  </h2>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white">
                  <X size={15} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="drawer-body flex flex-col gap-4">
                <div>
                  <label className="field-label">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Abhishek Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="drawer-input"
                  />
                </div>
                <div>
                  <label className="field-label">Email ID *</label>
                  <input
                    type="email"
                    placeholder="e.g. abhishek@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="drawer-input"
                  />
                </div>
                <div>
                  <label className="field-label">
                    Password {editUser ? "(Leave blank to keep unchanged)" : "*"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editUser}
                    className="drawer-input"
                  />
                </div>
                <div>
                  <label className="field-label">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="drawer-input cursor-pointer"
                  >
                    <option value="user">User (Standard Access)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="drawer-input cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="drawer-footer flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1.5px solid var(--color-border)",
                    color: "var(--color-muted-foreground)",
                    background: "transparent",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: "11px 0",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
                  }}
                >
                  {editUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      {/* Reusable ConfirmModal */}
      <ConfirmModal
        open={!!deleteTargetId}
        title="Delete User"
        message="Are you sure you want to delete this user account? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}
