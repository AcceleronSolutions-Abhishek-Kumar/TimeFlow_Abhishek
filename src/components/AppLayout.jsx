import * as React from "react"
import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { format } from "date-fns"
import { Bell, Sun, Moon, Search, LogOut } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light" : "Switch to Dark"}
      className="relative h-8 w-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
      style={{ color: isDark ? "#fbbf24" : "#6366f1" }}
    >
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "rotate(0) scale(1)" : "rotate(90deg) scale(0)",
        }}
      >
        <Sun size={16} />
      </span>
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "rotate(-90deg) scale(0)" : "rotate(0) scale(1)",
        }}
      >
        <Moon size={16} />
      </span>
    </button>
  )
}

function AppLayout() {
  const today = new Date()
  const { logout } = useAuth()
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* ── Header ─────────────────────────────────── */}
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 px-5 border-b"
          style={{
            background: "var(--color-background)",
            borderColor: "var(--color-border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center" />

          <div
            className="h-5 w-px"
            style={{ background: "var(--color-border)" }}
          />

          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ color: "var(--color-muted-foreground)" }}
            />
            <input
              type="search"
              placeholder="Search tasks…"
              className="dark-input h-9"
              style={{ paddingLeft: "36px", borderRadius: "8px" }}
            />
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-3">
            <span
              className="hidden sm:block text-xs font-medium"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {format(today, "EEE, MMM d, yyyy")}
            </span>
            <ThemeToggle />

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ── Page Content ───────────────────────────── */}
        <div className="p-5 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { AppLayout }
