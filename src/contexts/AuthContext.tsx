'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getUser, setUser, logout as clearUser, generateId, User } from '@/lib/storage'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  guestSignIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user in localStorage
    const existingUser = getUser()
    if (existingUser) {
      setUserState(existingUser)
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: 'Please fill in all fields' }
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' }
    }

    // Simple localStorage-based auth
    const storedUser = getUser()
    if (storedUser && storedUser.email === email) {
      setUserState(storedUser)
      return { error: null }
    }

    // Create user if doesn't exist (for demo purposes)
    const newUser: User = {
      id: generateId(),
      email,
      name: email.split('@')[0],
      created_at: new Date().toISOString()
    }
    setUser(newUser)
    setUserState(newUser)
    return { error: null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!email || !password || !name) {
      return { error: 'Please fill in all fields' }
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' }
    }

    const newUser: User = {
      id: generateId(),
      email,
      name,
      created_at: new Date().toISOString()
    }
    setUser(newUser)
    setUserState(newUser)
    return { error: null }
  }

  const signOut = async () => {
    clearUser()
    setUserState(null)
  }

  const guestSignIn = async () => {
    const guestUser: User = {
      id: generateId(),
      email: `guest_${Date.now()}@lifetracker.guest`,
      name: 'Guest User',
      created_at: new Date().toISOString()
    }
    setUser(guestUser)
    setUserState(guestUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, guestSignIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
