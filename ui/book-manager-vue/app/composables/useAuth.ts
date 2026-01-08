import type { LoginInput } from '#shared/schemas/auth' 

export const useAuth = () => {
  const config = useRuntimeConfig()
  // 1. 获取 Pinia Store (状态存储)
  const authStore = useAuthStore()
  // 2. 获取 Cookie (持久化存储，设置过期时间为 7 天)
  const accessToken = useCookie('access_token', { maxAge: 60 * 60 * 2, sameSite: 'lax' })
  const refreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })

  // 3. 计算属性：判断是否已登录
  const isLoggedIn = computed(() => !!accessToken.value)

  /**
   * 登录逻辑
   */
  const login = async (credentials: LoginInput) => {
    try {
      // 调用 Spring Boot 的登录接口
      const data = await $fetch<{ access_token: string, refresh_token: string }>(`${config.public.apiUrl}/api/v1/auth/authenticate`, {
        method: 'POST',
        body: credentials,
      })

      // 更新持久化存储
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      authStore.setToken(data.access_token)

      // 获取用户信息
      await fetchUserProfile()

      // 跳转到首页或来源页
      await navigateTo('/')
    }
    catch (error: any) {
      throw createError({ statusCode: 401, message: '登录验证失败' })
    }
  }

  /**
   * 获取个人资料
   */
  const fetchUserProfile = async () => {
    if (!accessToken.value) return
    try {
      // useApi 内部会自动在 Header 带上 accessToken
      const user = await useApi('/api/users/profile')
      authStore.setUser(user)
    }
    catch (err) {
      // 如果获取资料失败，可能 Token 刚刚失效，尝试刷新或登出
      logout()
    }
  }

  /**
   * 登出逻辑
   */
  const logout = async () => {
    // 1. 如果后端有登出接口（销毁 Refresh Token），先调用它
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})

    // 2. 清除本地状态
    accessToken.value = null
    refreshToken.value = null
    authStore.clearAuth()

    // 3. 跳转到登录页
    await navigateTo('/login')
  }

  return {
    user: computed(() => authStore.user),
    isLoggedIn: computed(() => !!accessToken.value),
    login,
    logout,
    fetchUserProfile,
  }
}
