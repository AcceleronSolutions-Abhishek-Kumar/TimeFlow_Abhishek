import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Context ─────────────────────────────────────────────────────────────────
const SidebarContext = React.createContext(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider")
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────
function SidebarProvider({ children, defaultOpen = true, open: controlledOpen, onOpenChange }) {
  const [_open, _setOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : _open

  const setOpen = React.useCallback((val) => {
    if (!isControlled) _setOpen(val)
    onOpenChange?.(val)
  }, [isControlled, onOpenChange])

  const toggleSidebar = React.useCallback(() => setOpen(!open), [open, setOpen])

  const [openMobile, setOpenMobile] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const handler = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Keyboard shortcut ctrl+b
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}>
      <div
        data-slot="sidebar-wrapper"
        className="flex h-svh w-full overflow-hidden"
        style={{ "--sidebar-width": "15rem", "--sidebar-width-icon": "3.75rem" }}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
function Sidebar({ side = "left", collapsible = "icon", className, children, ...props }) {
  const { state, open, openMobile, setOpenMobile, isMobile } = useSidebar()

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <aside
          data-slot="sidebar"
          data-mobile="true"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-svh flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out md:hidden",
            "w-[var(--sidebar-width)]",
            openMobile ? "translate-x-0" : "-translate-x-full",
            className
          )}
          {...props}
        >
          {children}
        </aside>
      </>
    )
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={state}
      data-collapsible={collapsible}
      className={cn(
        "group hidden h-svh flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out md:flex shrink-0 overflow-hidden",
        state === "expanded"
          ? "w-[var(--sidebar-width)]"
          : collapsible === "icon"
          ? "w-[var(--sidebar-width-icon)]"
          : "w-0 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

// ─── Trigger ─────────────────────────────────────────────────────────────────
function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar, isMobile, setOpenMobile, openMobile } = useSidebar()
  return (
    <button
      data-slot="sidebar-trigger"
      onClick={(e) => {
        onClick?.(e)
        if (isMobile) setOpenMobile(!openMobile)
        else toggleSidebar()
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
        className
      )}
      title="Toggle Sidebar (Ctrl+B)"
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

// ─── Rail ─────────────────────────────────────────────────────────────────────
function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex",
        className
      )}
      {...props}
    />
  )
}

// ─── Inset ────────────────────────────────────────────────────────────────────
function SidebarInset({ className, ...props }) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("flex flex-1 flex-col min-w-0", className)}
      {...props}
    />
  )
}

// ─── Header / Footer / Content ────────────────────────────────────────────────
function SidebarHeader({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-3 border-b border-sidebar-border shrink-0", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 p-3 border-t border-sidebar-border shrink-0", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden py-2", className)}
      {...props}
    />
  )
}

// ─── Group ─────────────────────────────────────────────────────────────────────
function SidebarGroup({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex flex-col w-full min-w-0 px-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({ className, ...props }) {
  const { state } = useSidebar()
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider transition-all duration-200 overflow-hidden",
        state === "collapsed" ? "opacity-0 h-0" : "opacity-100",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
function SidebarMenu({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuButton({
  isActive = false,
  className,
  children,
  tooltip,
  href,
  onClick,
  ...props
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const inner = (
    <span className="flex items-center gap-2 w-full min-w-0">
      {children}
    </span>
  )

  const baseClass = cn(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-colors duration-150",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "active:bg-sidebar-accent/80",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
    isCollapsed && "justify-center px-2",
    className
  )

  if (href) {
    return (
      <a href={href} data-active={isActive} className={baseClass} {...props}>
        {inner}
      </a>
    )
  }

  return (
    <button
      data-active={isActive}
      onClick={onClick}
      className={baseClass}
      {...props}
    >
      {inner}
    </button>
  )
}

function SidebarMenuBadge({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-[10px] font-medium text-sidebar-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

function SidebarSeparator({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-separator"
      className={cn("mx-2 my-1 h-px bg-sidebar-border", className)}
      {...props}
    />
  )
}

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
}
