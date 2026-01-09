import type { H3Event } from 'h3'

// 1. 创建一个全局锁，用于存储正在进行的刷新 Promise
let refreshTokenPromise: Promise<string | null> | null = null

export const proxyFetch = async <T>(event: H3Event, targetUrl: string, options: any = {}) : Promise<T> => {
  const config = useRuntimeConfig()
  const accessToken = getCookie(event, 'access_token')

  const fetchWithToken = (token: string | undefined) => {
    return $fetch<T>(targetUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
  }

  try {
    return await fetchWithToken(accessToken || '')
  }
  catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = getCookie(event, 'refresh_token')  
      // 如果没有 Refresh Token，直接向上抛出 401，前端会接住并跳转
      if (!refreshToken || targetUrl.includes('/auth/refresh')) {
        throw error 
      }
      // 互斥锁：防止多个并发业务请求同时触发多次 Java 刷新请求
      if (!refreshTokenPromise) {
        console.log('[Nitro] 发起 Token 刷新请求...')
        refreshTokenPromise = $fetch<{ accessToken: string }>(`${config.public.apiUrl}/api/v1/auth/refresh-token`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${refreshToken}` }
        }).then(res => {
          const newToken = res.accessToken
          setCookie(event, 'access_token', newToken, { path: '/', maxAge: 86400 })
          return newToken
        }).catch(err => {
          console.error('[Nitro] 刷新彻底失败:', err.message)
          deleteCookie(event, 'access_token')
          deleteCookie(event, 'refresh_token')
          return null
        }).finally(() => {
          refreshTokenPromise = null // 刷新结束，重置锁
        })       
      }
      // 所有并发的 401 请求都会等待同一个刷新 Promise
      const newToken = await refreshTokenPromise

      if (newToken) {
        console.log(`[Nitro] 使用新 Token 重试请求: ${targetUrl}`)
        return await fetchWithToken(newToken)
      }
    }

    // 如果不是 401 或者是刷新失败，直接把异常抛给前端
    throw error
  }
}
