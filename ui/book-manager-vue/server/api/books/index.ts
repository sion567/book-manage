export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event) // 获取 URL 中的 ?page=1&size=10
  const method = event.method // 通过判断 event.method 同时处理 GET（查）和 POST（增）
  const token = getCookie(event, 'access_token')

  return proxyFetch(event, `${config.public.apiUrl}/api/v1/books`, {
    method: 'GET',
    body: method === 'POST' ? await readBody(event) : undefined,
    query, // 将分页或搜索参数转发给 Java 后端
    headers: { Authorization: `Bearer ${token}` },
  })
})
