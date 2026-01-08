export default defineEventHandler(async (event) => {
  // 1. 从环境变量获取 Spring Boot 地址
  const { springApiUrl } = useRuntimeConfig()

  // 2. 将前端请求转发给 Spring Boot
  const data = await $fetch(`${springApiUrl}/api/v1/books`, {
    headers: {
      // 转发前端传来的 Token
      Authorization: getHeader(event, 'authorization') || '',
    },
  })
  return data
})
