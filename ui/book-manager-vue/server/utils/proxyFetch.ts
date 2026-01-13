import type { H3Event } from 'h3'
import type { TokenResponse } from '#shared/types/auth'

// 1. 创建一个全局锁，用于存储正在进行的刷新 Promise
let refreshTokenPromise: Promise<TokenResponse | null> | null = null

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
    debugLog(error);
    if (error.response?.status === 401) {
      const refreshToken = getCookie(event, 'refresh_token')  
      // 如果没有 Refresh Token，直接向上抛出 401，前端会接住并跳转
      if (!refreshToken || targetUrl.includes('/auth/refresh')) {
        throw error 
      }
      // 互斥锁：防止多个并发业务请求同时触发多次 Java 刷新请求
      console.log('[Nitro] 发起 Token 刷新请求 0...')
      if (!refreshTokenPromise) {
        console.log('[Nitro] 发起 Token 刷新请求 1...')
        refreshTokenPromise = $fetch<TokenResponse>(`${config.public.apiUrl}/api/v1/auth/refresh-token`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${refreshToken}` }
        }).then(res => {
          console.log('[Nitro] 刷新Token成功')
          console.log(`      res access: ${res.access_token}, refresh: ${res.refresh_token}`)
          const newToken = res.access_token
console.log(`------1------新 Token : ${newToken}`)
          setCookie(event, 'access_token', newToken, { path: '/', maxAge: 86400 })
          return res as TokenResponse
        }).catch(err => {
          console.error('[Nitro] 刷新彻底失败:', err.message)
          deleteCookie(event, 'access_token')
          deleteCookie(event, 'refresh_token')
          return null
        }).finally(() => {
          console.log('[Nitro] finally.')
          refreshTokenPromise = null // 刷新结束，重置锁
        })       
      }
      // 此时 refreshPromise 的类型是 Promise<TokenResponse> | null
      // 为了安全，我们需要一个局部常量并断言它非空（或者用 if 判断）
      const currentPromise = refreshTokenPromise
      if (!currentPromise) throw new Error('Refresh logic error')
      // await 拿到的 res 就会自动推导为 TokenResponse 类型
      const res = await currentPromise // 所有并发的 401 请求都会等待同一个刷新 Promise
      const newAccess = res?.access_token // // res?. 表示：如果 res 有值就取 access_token，否则返回 undefined
      if (newAccess) {
        console.log(`[Nitro] 使用新 Token 重试请求: ${targetUrl}`)
        console.log(`      新 Token : ${newAccess}`)
        return await fetchWithToken(newAccess)
      }
    }

    // 如果不是 401 或者是刷新失败，直接把异常抛给前端
    throw error
  }
}

function debugLog(error: any) {
  console.group('--- API 错误详细诊断 ---');
  // 1. 基本信息
  console.error('Message:', error.message);
  console.error('URL:', error.request); // 请求的完整路径

  // 2. 响应状态信息 (后端返回的状态码)
  if (error.response) {
    console.error('Status Code:', error.response.status);
    console.error('Status Text:', error.response.statusText);
    
    // 3. 后端返回的真实 Body (最重要！这里通常有报错详情)
    console.error('Response Data:', error.response._data);
    
    // 4. 响应头
    console.error('Headers:', Object.fromEntries(error.response.headers.entries()));
  }

  // 5. 打印完整的堆栈跟踪 (定位是代码哪一行崩了)
  console.error('Stack Trace:', error.stack);
  console.groupEnd();
}