import * as React from "react"

const ThemeContext = React.createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => {
    try {
      return localStorage.getItem("tmt-theme") || "dark"
    } catch {
      return "dark"
    }
  })

  React.useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    try {
      localStorage.setItem("tmt-theme", theme)
    } catch {}
  }, [theme])

  const toggleTheme = React.useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  )

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
