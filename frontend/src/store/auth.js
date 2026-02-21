// src/store/auth.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuth: false,
      setAuth: (user, token) => set({ user, token, isAuth: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuth: false }),
      isSA: () => get().user?.role === 'SUPERADMIN',
      isAdmin: () => ['SUPERADMIN','ADMIN'].includes(get().user?.role),
    }),
    { name: 'pantera-auth', partialize: s => ({ user: s.user, token: s.token, isAuth: s.isAuth }) }
  )
)
