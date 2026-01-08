import type { FetchResponse, FetchOptions } from 'ofetch'

// 定义钩子参数的接口，方便阅读
interface ResponseErrorContext {
  response: FetchResponse<any>,
  options: FetchOptions
}

export const useApi = (url: string, opts: any = {}) => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  return $fetch(url, {
    ...opts,
    // 1. 请求拦截：自动注入 Access Token
    onRequest({ options }: { options: FetchOptions }) {
      if (authStore.accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.accessToken}`,
        }
      }
    },

    // 2. 响应错误拦截：处理 401
    async onResponseError({ response, options }: ResponseErrorContext) {
      if (response.status === 401) {
        const refreshToken = useCookie('refresh_token')
        const accessToken = useCookie('access_token')

        if (refreshToken.value) {
          try {
            // 请求 Spring Boot 的刷新接口
            const { access } = await $fetch<{ access: string }>('/api/auth/refresh', {
              method: 'POST',
              body: { refresh: refreshToken.value }, // 将 Refresh Token 传给后端
            })

            // 更新 Access Token
            accessToken.value = access

            // Nuxt 4 环境中，为了实现极速的 API 类型推导，Nuxt 对 $fetch 的 method 参数做了非常严格的字面量限制。而当你把 options 作为一个整体对象传递时，TypeScript 的类型系统会担心 options.method 包含一些非标准的字符串（比如 'PURGE' 或空字符串），从而认为它与 NitroFetchOptions 的要求不匹配
            // return $fetch(url, {
            //   ...options,
            //   method: options.method as 'GET' | 'POST' | 'PUT' | 'DELETE'
            // })
            return $fetch(url, options as any)
          }
          catch (err) {
            // Refresh Token 也过期了，彻底登出
            accessToken.value = null
            refreshToken.value = null
            await navigateTo('/login')
          }
        }
      }
    },
  })
}
