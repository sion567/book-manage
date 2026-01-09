export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'access_token')
    const config = useRuntimeConfig()

    // 2. 将请求转发给真正的后端 (Spring Boot)
    const response = await proxyFetch(event, `${config.public.apiUrl}/api/v1/users/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response
  }
  catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.message || 'Internal Server Error',
      data: error.data,
    })
  }
})
