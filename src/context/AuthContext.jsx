import * as React from "react"
import { authApi } from "@/services/api"

const AuthContext = React.createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try {
      const saved = localStorage.getItem("tmt_auth_user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = React.useState(() => {
    return localStorage.getItem("tmt_auth_token") || null
  })

  const login = async (identifier, password) => {
    const res = await authApi.login(identifier, password)
    if (res.success && res.user) {
      setUser(res.user)
      setToken(res.token)
      localStorage.setItem("tmt_auth_user", JSON.stringify(res.user))
      localStorage.setItem("tmt_auth_token", res.token)
      return { success: true }
    }
    return { success: false, error: res.error || "Login failed" }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("tmt_auth_user")
    localStorage.removeItem("tmt_auth_token")
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
