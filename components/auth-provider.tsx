"use client"

import type React from "react"

import { createContext, useContext } from "react"

// Define a simplified auth context type
type AuthContextType = {
  user: null
  session: null
  isLoading: boolean
  signIn: () => Promise<void>
  signUp: () => Promise<void>
  signOut: () => Promise<void>
}

// Create a context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

// Simplified provider that doesn't actually perform authentication
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Provide dummy implementation
  const value = {
    user: null,
    session: null,
    isLoading: false,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Export the hook for components that need it
export const useAuth = () => {
  return useContext(AuthContext)
}
