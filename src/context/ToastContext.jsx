import * as React from "react"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"

import { registerToastListener } from "@/services/api"

const ToastContext = React.createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const showToast = React.useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [])

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  React.useEffect(() => {
    registerToastListener(showToast)
  }, [showToast])

  // Helper styling for toast types
  const getToastStyle = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "rgba(16,185,129,0.12)",
          border: "rgba(16,185,129,0.25)",
          color: "#10b981",
          icon: CheckCircle2,
        }
      case "error":
        return {
          bg: "rgba(239,68,68,0.12)",
          border: "rgba(239,68,68,0.25)",
          color: "#ef4444",
          icon: XCircle,
        }
      case "warning":
        return {
          bg: "rgba(245,158,11,0.12)",
          border: "rgba(245,158,11,0.25)",
          color: "#f59e0b",
          icon: AlertTriangle,
        }
      case "info":
      default:
        return {
          bg: "rgba(59,130,246,0.12)",
          border: "rgba(59,130,246,0.25)",
          color: "#3b82f6",
          icon: Info,
        }
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── Toast Container ── */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
          width: "320px",
          maxWidth: "90vw",
        }}
      >
        {toasts.map((t) => {
          const style = getToastStyle(t.type)
          const Icon = style.icon
          return (
            <div
              key={t.id}
              className="animate-slide-in"
              style={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: style.bg,
                color: style.color,
                border: `1.5px solid ${style.border}`,
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                transition: "all 0.25s ease-in-out",
              }}
            >
              <Icon size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1, fontSize: "12.5px", fontWeight: 700, lineHeight: 1.4, color: "var(--color-foreground)" }}>
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: style.color,
                  opacity: 0.6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  marginTop: "2px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
              >
                <X size={14} />
              </button>
            </div>
          )}
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
