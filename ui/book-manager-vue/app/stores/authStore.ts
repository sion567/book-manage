import { defineStore } from 'pinia'
import type { UserProfile } from '#shared/schemas/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<UserProfile | null>(null)

  function setToken(token: string) {
    accessToken.value = token
  }

  function setUser(userData: UserProfile) {
    user.value = userData
  }

  function clearAuth() {
    accessToken.value = null
    user.value = null
  }

  return {
    accessToken,
    user,
    setToken,
    setUser,
    clearAuth,
  }
})
