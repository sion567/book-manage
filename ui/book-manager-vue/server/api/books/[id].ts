export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'access_token') // 从 Cookie 获取 JWT

  const id = getRouterParam(event, 'id') // 获取 URL 中的 id 参数
  const method = event.method // 处理 GET（查单条）、PUT（改）和 DELETE（删）

  const targetUrl = `${config.public.apiUrl}/api/v1/books/${id}`

  try {
    return await proxyFetch(event, targetUrl, {
      method,
      // PUT 请求时读取 Body
      body: method === 'PUT' ? await readBody(event) : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
  catch (error: any) {
    // 统一处理后端返回的错误
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.response?._data?.message || '后端接口调用失败',
    })
  }
})
