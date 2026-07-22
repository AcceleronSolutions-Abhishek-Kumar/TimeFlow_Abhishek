import * as React from "react"
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  Folder,
  Layers,
  X,
  FileText,
  Tag,
} from "lucide-react"
import { projectApi, moduleApi } from "@/services/api"
import ConfirmModal from "@/components/ConfirmModal"

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = React.useState("projects") // "projects" | "modules"

  // Data states
  const [projects, setProjects] = React.useState([])
  const [modules, setModules] = React.useState([])
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  // Modal states
  const [projModalOpen, setProjModalOpen] = React.useState(false)
  const [editProject, setEditProject] = React.useState(null)

  const [modModalOpen, setModModalOpen] = React.useState(false)
  const [editModule, setEditModule] = React.useState(null)

  // Forms
  const [projForm, setProjForm] = React.useState({ name: "", code: "", description: "", status: "active" })
  const [modForm, setModForm] = React.useState({ name: "", projectId: "", description: "" })

  // Load Data
  const loadAll = React.useCallback(async () => {
    setLoading(true)
    const pRes = await projectApi.fetchProjects()
    const mRes = await moduleApi.fetchModules()
    setProjects(pRes.projects || [])
    setModules(mRes.modules || [])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadAll()
  }, [loadAll])

  // ── Project Modal Handlers ──────────────────────────────────────────────────
  const openAddProject = () => {
    setEditProject(null)
    setProjForm({ name: "", code: "", description: "", status: "active" })
    setProjModalOpen(true)
  }

  const openEditProject = (proj) => {
    setEditProject(proj)
    setProjForm({ name: proj.name, code: proj.code || "", description: proj.description || "", status: proj.status || "active" })
    setProjModalOpen(true)
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    if (!projForm.name.trim()) return

    if (editProject) {
      await projectApi.updateProject(editProject.id, projForm)
    } else {
      await projectApi.createProject(projForm)
    }
    setProjModalOpen(false)
    loadAll()
  }

  // ── Module Modal Handlers ───────────────────────────────────────────────────
  const openAddModule = () => {
    setEditModule(null)
    setModForm({ name: "", projectId: projects[0]?.id || "", description: "" })
    setModModalOpen(true)
  }

  const openEditModule = (mod) => {
    setEditModule(mod)
    setModForm({ name: mod.name, projectId: mod.projectId || "", description: mod.description || "" })
    setModModalOpen(true)
  }

  const handleSaveModule = async (e) => {
    e.preventDefault()
    if (!modForm.name.trim()) return

    const selectedProj = projects.find((p) => p.id === modForm.projectId)
    const payload = {
      ...modForm,
      projectName: selectedProj ? selectedProj.name : "",
    }

    if (editModule) {
      await moduleApi.updateModule(editModule.id, payload)
    } else {
      await moduleApi.createModule(payload)
    }
    setModModalOpen(false)
    loadAll()
  }

  const [deleteTarget, setDeleteTarget] = React.useState(null)

  const askDeleteProject = (id) => {
    setDeleteTarget({
      id,
      type: "project",
      title: "Delete Project",
      message: "Are you sure you want to delete this project? Associated tasks and modules may be affected.",
    })
  }

  const askDeleteModule = (id) => {
    setDeleteTarget({
      id,
      type: "module",
      title: "Delete Module",
      message: "Are you sure you want to delete this module? This action cannot be undone.",
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { id, type } = deleteTarget
    setDeleteTarget(null)

    if (type === "project") {
      await projectApi.deleteProject(id)
    } else {
      await moduleApi.deleteModule(id)
    }
    loadAll()
  }

  // Filtered lists
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredModules = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.projectName && m.projectName.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--color-foreground)" }}>
            Project &amp; Module Master
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Manage projects, work types, and modules for task logging.
          </p>
        </div>

        {/* Tab Switcher & Add Button */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)" }}
          >
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "projects"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Folder size={13} className="inline mr-1.5" />
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab("modules")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "modules"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers size={13} className="inline mr-1.5" />
              Modules ({modules.length})
            </button>
          </div>

          <button
            onClick={activeTab === "projects" ? openAddProject : openAddModule}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
          >
            <Plus size={15} />
            {activeTab === "projects" ? "Add Project" : "Add Module"}
          </button>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={activeTab === "projects" ? "Search projects by name or code…" : "Search modules…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="drawer-input h-9 text-xs"
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {/* ── Content Table ─────────────────────────────────────── */}
      <div className="panel-card flex-1">
        {activeTab === "projects" ? (
          /* PROJECTS TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)", color: "#64748b" }}>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Project Name</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      No projects found. Click "Add Project" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p, idx) => (
                    <tr key={p.id} className="task-row hover:bg-slate-100/60 dark:hover:bg-white/[0.03]">
                      <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--color-foreground)" }}>
                        {p.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{p.code || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{p.description || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            p.status === "active"
                              ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                              : "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30"
                          }`}
                        >
                          {p.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditProject(p)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15"
                            title="Edit Project"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => askDeleteProject(p.id)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-500/15"
                            title="Delete Project"
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
        ) : (
          /* MODULES TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)", color: "#64748b" }}>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Module Name</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {filteredModules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                      No modules found. Click "Add Module" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredModules.map((m, idx) => (
                    <tr key={m.id} className="task-row hover:bg-slate-100/60 dark:hover:bg-white/[0.03]">
                      <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--color-foreground)" }}>
                        {m.name}
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                        {m.projectName || "General Module"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{m.description || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModule(m)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15"
                            title="Edit Module"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => askDeleteModule(m.id)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-500/15"
                            title="Delete Module"
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
        )}
      </div>

      {/* ── PROJECT DRAWER ────────────────────────────────────── */}
      {projModalOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setProjModalOpen(false)} />
          <div className="drawer-panel">
            {/* Header */}
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
                    Project Master Setup
                  </span>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1.2,
                      letterSpacing: "-0.3px",
                      textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    {editProject ? "Edit Project" : "Add New Project"}
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                    Configure project details for task tracking
                  </p>
                </div>
                <button
                  onClick={() => setProjModalOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.85)",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveProject} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="drawer-body flex flex-col gap-5">
                <div>
                  <div className="drawer-section-label">
                    <Folder size={12} className="inline mr-1 text-indigo-500" /> Project Details
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label className="field-label">
                        Project Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TimeFlow App, Client Website…"
                        value={projForm.name}
                        onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
                        required
                        className="drawer-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Project Code</label>
                      <input
                        type="text"
                        placeholder="e.g. TFA, CWEB…"
                        value={projForm.code}
                        onChange={(e) => setProjForm({ ...projForm, code: e.target.value })}
                        className="drawer-input font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="drawer-section-label">
                    <FileText size={12} className="inline mr-1 text-indigo-500" /> Description
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Short description of this project…"
                    value={projForm.description}
                    onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                    className="drawer-input"
                    style={{ resize: "vertical", lineHeight: 1.65 }}
                  />
                </div>

                <div>
                  <div className="drawer-section-label">
                    <Tag size={12} className="inline mr-1 text-indigo-500" /> Status
                  </div>
                  <select
                    value={projForm.status}
                    onChange={(e) => setProjForm({ ...projForm, status: e.target.value })}
                    className="drawer-input cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="drawer-footer flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setProjModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1.5px solid var(--color-border)",
                    color: "var(--color-muted-foreground)",
                    background: "transparent",
                    cursor: "pointer",
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
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
                  }}
                >
                  {editProject ? <><Pencil size={14} /> Save Changes</> : <><Plus size={14} /> Create Project</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── MODULE DRAWER ─────────────────────────────────────── */}
      {modModalOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setModModalOpen(false)} />
          <div className="drawer-panel">
            {/* Header */}
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
                    Module Master Setup
                  </span>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1.2,
                      letterSpacing: "-0.3px",
                      textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    {editModule ? "Edit Module" : "Add New Module"}
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                    Configure work types and modules for projects
                  </p>
                </div>
                <button
                  onClick={() => setModModalOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.85)",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveModule} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="drawer-body flex flex-col gap-5">
                <div>
                  <div className="drawer-section-label">
                    <Layers size={12} className="inline mr-1 text-indigo-500" /> Module Details
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label className="field-label">
                        Module Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Development, Bug Fix…"
                        value={modForm.name}
                        onChange={(e) => setModForm({ ...modForm, name: e.target.value })}
                        required
                        className="drawer-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Belongs to Project</label>
                      <select
                        value={modForm.projectId}
                        onChange={(e) => setModForm({ ...modForm, projectId: e.target.value })}
                        className="drawer-input cursor-pointer"
                      >
                        <option value="">-- General (All Projects) --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.code ? `(${p.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="drawer-section-label">
                    <FileText size={12} className="inline mr-1 text-indigo-500" /> Description
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Short description of this module…"
                    value={modForm.description}
                    onChange={(e) => setModForm({ ...modForm, description: e.target.value })}
                    className="drawer-input"
                    style={{ resize: "vertical", lineHeight: 1.65 }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="drawer-footer flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setModModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1.5px solid var(--color-border)",
                    color: "var(--color-muted-foreground)",
                    background: "transparent",
                    cursor: "pointer",
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
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
                  }}
                >
                  {editModule ? <><Pencil size={14} /> Save Changes</> : <><Plus size={14} /> Create Module</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      {/* Reusable ConfirmModal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={deleteTarget?.title || "Confirm Delete"}
        message={deleteTarget?.message || "Are you sure you want to delete this item?"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
