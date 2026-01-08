export default defineEventHandler(async (event) => {
  try {
    // 1. 获取前端传来的 body
    const body = await readBody(event)
    const config = useRuntimeConfig()

    // 2. 将请求转发给真正的后端 (Spring Boot)
    const response = await $fetch(`${config.public.apiUrl}/api/v1/auth/authenticate`, {
      method: 'POST',
      body: body,
    })

    // 3. 处理响应（比如在 Nuxt 这层设置加密 Cookie，或者直接返回给前端）
    return response
  }
  catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.message || 'Internal Server Error',
      // data 字段可以存放后端返回的具体错误详情
      data: error.data,
    })
  }
})
