export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const refreshToken = getCookie(event, 'refresh_token')

  const response = await $fetch<{ accessToken: string, refreshToken: string }>(
    `${config.public.apiUrl}/api/v1/auth/refresh-token`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` }
    }
  )

  // 关键：在服务器端同步更新 Cookie
  setCookie(event, 'access_token', response.accessToken, {
    path: '/',
    httpOnly: true, // 建议开启
    maxAge: 60 * 60 * 24
  })

  return response
})