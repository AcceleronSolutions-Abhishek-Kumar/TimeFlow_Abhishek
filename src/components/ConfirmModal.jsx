import * as React from "react"
import { AlertTriangle, X } from "lucide-react"

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel()
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 99998,
          animation: "overlay-in 0.2s ease both",
        }}
      />

      {/* Modal Card Container */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
          width: "90%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          border: "1.5px solid var(--color-border)",
          background: "var(--color-card)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          animation: "modal-scale-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid var(--color-border)",
            background: "rgba(239, 68, 68, 0.05)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "var(--color-foreground)",
                margin: 0,
              }}
            >
              {title || "Confirm Action"}
            </h3>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-muted-foreground)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-foreground)",
              opacity: 0.85,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {message || "Are you sure you want to proceed?"}
          </p>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "14px 20px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            background: "rgba(255, 255, 255, 0.01)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: 700,
              border: "1.5px solid var(--color-border)",
              color: "var(--color-foreground)",
              background: "transparent",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            No, Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 20px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: 800,
              border: "none",
              color: "#fff",
              background: "#ef4444",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = 0.9
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = 1
            }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </>
  )
}
