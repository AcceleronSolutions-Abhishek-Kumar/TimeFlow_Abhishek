import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, FolderKanban, Users, ChevronRight, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

function NavButton({ item, isCollapsed }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive =
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)

  return (
    <button
      onClick={() => navigate(item.path)}
      title={isCollapsed ? item.label : undefined}
      className="w-full h-10 flex items-center gap-3 px-2 rounded-xl transition-all duration-300 ease-in-out text-left overflow-hidden relative"
      style={
        isActive
          ? {
              background: item.activeBg,
              color: item.color,
              boxShadow: isCollapsed ? `0 0 14px ${item.glow}` : "none",
            }
          : {
              background: "transparent",
              color: "#7b8698",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent"
      }}
    >
      {/* Icon */}
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-300"
        style={
          isActive
            ? {
                background: item.activeBg,
                color: item.color,
                boxShadow: `0 0 12px ${item.glow}`,
              }
            : { background: "rgba(255,255,255,0.04)", color: "#64748b" }
        }
      >
        <item.icon size={17} />
      </span>

      {/* Text & Chevron */}
      <div
        className={cn(
          "flex items-center justify-between flex-1 min-w-0 transition-all duration-300 ease-in-out whitespace-nowrap",
          isCollapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[180px]"
        )}
      >
        <span className="truncate tracking-tight font-semibold text-sm">{item.label}</span>
        {isActive && <ChevronRight size={13} className="shrink-0 ml-1" style={{ color: item.color, opacity: 0.7 }} />}
      </div>
    </button>
  )
}

function LogoFull({ isCollapsed }) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-0.5 transition-all duration-300 ease-in-out whitespace-nowrap",
        isCollapsed ? "opacity-0 max-w-0 pointer-events-none overflow-hidden" : "opacity-100 max-w-[180px]"
      )}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.5px", color: "#ffffff", lineHeight: 1 }}>
          TIME
        </span>
        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.5px", color: "#818cf8", lineHeight: 1 }}>
          FLOW
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 12, height: 1.5, background: "#475569", flexShrink: 0 }} />
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#94a3b8",
            whiteSpace: "nowrap",
          }}
        >
          Daily Planner
        </span>
        <div style={{ width: 12, height: 1.5, background: "#475569", flexShrink: 0 }} />
      </div>
    </div>
  )
}

function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { user, isAdmin, logout } = useAuth()

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "TF"

  const navItems = [
    {
      section: "MAIN",
      items: [
        {
          label: "Dashboard",
          path: "/",
          icon: LayoutDashboard,
          color: "#818cf8",
          glow: "rgba(99,102,241,0.4)",
          activeBg: "rgba(99,102,241,0.16)",
          activeBorder: "#6366f1",
        },
        ...(isAdmin
          ? [
              {
                label: "Projects & Modules",
                path: "/projects",
                icon: FolderKanban,
                color: "#c084fc",
                glow: "rgba(192,132,252,0.4)",
                activeBg: "rgba(192,132,252,0.16)",
                activeBorder: "#c084fc",
              },
              {
                label: "User Management",
                path: "/users",
                icon: Users,
                color: "#34d399",
                glow: "rgba(52,211,153,0.4)",
                activeBg: "rgba(52,211,153,0.16)",
                activeBorder: "#34d399",
              },
            ]
          : []),
      ],
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
      style={{
        background: "#000000",
        borderRight: "1px solid #1a1f2c",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <SidebarHeader
        style={{
          borderColor: "#1a1f2c",
          padding: "14px 12px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 0 18px rgba(99,102,241,0.55), 0 0 36px rgba(99,102,241,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
              TF
            </span>
          </div>
          <LogoFull isCollapsed={isCollapsed} />
        </div>
      </SidebarHeader>

      <div style={{ height: 1, background: "#1e293b", margin: "0 12px" }} />

      {/* ── Navigation ───────────────────────────────────── */}
      <SidebarContent style={{ padding: "10px 12px" }}>
        {navItems.map((group) => (
          <SidebarGroup key={group.section} style={{ padding: 0, marginBottom: 4 }}>
            <p
              className={cn(
                "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                isCollapsed ? "opacity-0 max-h-0 py-0" : "opacity-100 max-h-6"
              )}
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#94a3b8",
                padding: "0 4px",
                marginBottom: 6,
                marginTop: 4,
              }}
            >
              {group.section}
            </p>
            <SidebarMenu style={{ gap: 4 }}>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <NavButton item={item} isCollapsed={isCollapsed} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── User Footer ──────────────────────────────────── */}
      <SidebarFooter
        style={{
          borderTop: "1px solid #1a1f2c",
          padding: "10px 12px",
        }}
      >
        <div
          className="flex items-center gap-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out overflow-hidden"
          style={{ background: "transparent" }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: user?.role === "admin"
                ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                : "linear-gradient(135deg, #2563eb, #0284c7)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: "#fff",
              flexShrink: 0,
              letterSpacing: "-0.3px",
            }}
          >
            {initials}
          </div>

          <div
            className={cn(
              "flex flex-col gap-0.5 min-w-0 transition-all duration-300 ease-in-out whitespace-nowrap flex-1",
              isCollapsed ? "opacity-0 max-w-0 pointer-events-none overflow-hidden" : "opacity-100 max-w-[160px]"
            )}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#d1d5db",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Abhishek"}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: user?.role === "admin" ? "#a855f7" : "#38bdf8",
                lineHeight: 1.2,
              }}
            >
              {user?.role || "User"} Mode
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
