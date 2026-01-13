import { defineStore } from 'pinia'
import type { LoginInput, UserProfile } from '#shared/schemas/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24, // 1天有效
    path: '/',
    watch: true, // 开启监听，确保多个标签页同步
  })
  const refreshToken = useCookie<string | null>('refresh_token', { maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' })
  const user = ref<UserProfile | null>(null)

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  function updateTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
  }

  // 获取资料的逻辑
  const fetchUserProfile = async () => {
    if (!accessToken.value) return
    try {
      user.value = await useApi<UserProfile>('/api/users/profile')
    } catch (err) {
      // 如果获取资料失败（如 Token 彻底失效），则清理状态
      logout()
    }
  }

  const initAuth = async () => {
    // 只有当 Cookie 中存在 Token 且 Pinia 内存中没有 User 时才执行
    if (accessToken.value && !user.value) {
      console.log('[Auth] 正在从 Cookie 恢复用户状态...')
      await fetchUserProfile()
    }
  }

  const login = async (credentials: LoginInput) => {
    // 这里的 /api/auth/login 对应 server/api/auth/login.post.ts，然后server 调用 Spring Boot 的登录接口
    const data = await $fetch<{ access_token: string, refresh_token: string }>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    await fetchUserProfile()
    await navigateTo('/')
  }

  async function logout() {
    await useApi('/api/auth/logout', { method: 'POST' }).catch(() => {})
    clearAuth()
    await navigateTo('/login')
  }

  return {
    accessToken,
    refreshToken,
    updateTokens,
    user,
    initAuth,
    login,
    logout,
    clearAuth,
  }
})
