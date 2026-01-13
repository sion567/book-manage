import type { FetchResponse, FetchOptions } from 'ofetch'
import type { TokenResponse } from '#shared/types/auth'

// 定义钩子参数的接口，方便阅读
interface ResponseErrorContext {
  response: FetchResponse<any>
  options: FetchOptions
}

// 1. 在导出函数外部定义，确保所有 useApi 实例共享同一个锁
let refreshPromise: Promise<TokenResponse> | null = null

// 在 Nuxt 4 架构中，实现“前端无感知刷新”的核心在于：将刷新逻辑完全下沉到 Nuxt Server 层（Nitro）。前端 useApi 只需要简单请求 /api/...，不再需要编写任何拦截器或手动调用刷新。
export const useApi = <T>(url: string, opts: any = {}) => {
  const authStore = useAuthStore()

  return $fetch<T>(url, {
    ...opts,
    // 1. 请求拦截：自动注入 Access Token
    onRequest({ options }: { options: FetchOptions }) {
      if (authStore.accessToken) {
        // 使用 Headers 对象确保操作的健壮性
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${authStore.accessToken}`)
        options.headers = headers
      }
    },
    // 2. 响应错误拦截：处理 401
    async onResponseError(context: ResponseErrorContext) {
      const { response, options } = context
      // 排除刷新接口本身，防止死循环
      if (url.includes('/api/auth/refresh')) return
      if (response.status === 401 && !options.retry) {
        options.retry = 1 // 标记该请求已重试，防止无限循环

        if (authStore.refreshToken) {
          try {
            // 2. 核心并发控制：如果当前没有刷新任务，则创建一个
            if (!refreshPromise) {
              refreshPromise = $fetch<TokenResponse>('/api/auth/refresh', {
                method: 'POST',
                body: { refresh: authStore.refreshToken },
              }).finally(() => {
                // 3. 无论成功失败，结束后必须释放锁
                refreshPromise = null
              })
            }

            // 4. 所有 401 请求都会在这里排队等待同一个刷新结果
            const { access_token, refresh_token} = await refreshPromise
            // 5. 更新全局 Store（这会自动同步 Cookie）
            authStore.updateTokens(access_token, refresh_token)

            // 6. 重建 Headers 并重新发起原始请求
            const headers = new Headers(options.headers)
            headers.set('Authorization', `Bearer ${access_token}`)
            options.headers = headers

            console.log('--- 重试请求调试 ---')
            console.log('目标 URL:', url)
            console.log('最终发送的 Token 变量:', access_token)
            console.log('最终 Headers 确认:', Object.fromEntries(headers.entries()))


            // Nuxt 4 环境中，为了实现极速的 API 类型推导，Nuxt 对 $fetch 的 method 参数做了非常严格的字面量限制。而当你把 options 作为一个整体对象传递时，TypeScript 的类型系统会担心 options.method 包含一些非标准的字符串（比如 'PURGE' 或空字符串），从而认为它与 NitroFetchOptions 的要求不匹配
            // return $fetch(url, {
            //   ...options,
            //   method: options.method as 'GET' | 'POST' | 'PUT' | 'DELETE'
            // })
            const retryResponse = await $fetch(url, options as any)

            // 7. 关键：将重试结果注入当前响应上下文，确保 useAsyncData 拿到新数据
            if (context.response) {
              context.response._data = retryResponse
            }
            return retryResponse
          }
          catch (err) {
            // Refresh Token 也过期了，彻底登出
            authStore.clearAuth()
            await navigateTo('/login')
            return Promise.reject(err)
          }
        }
      }
    },
  })
}
