import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  return {
    user,
    token: storedToken,
    isAuthenticated: !!storedToken,
    isAdmin: user?.role === 'admin',

    login: (token: string, user: User) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({
        token,
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
      })
    },

    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      })
    },

    setUser: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isAdmin: user.role === 'admin' })
    },
  }
})
