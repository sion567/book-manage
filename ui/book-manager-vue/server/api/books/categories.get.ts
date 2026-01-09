export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'access_token')

  return proxyFetch(event, `${config.public.apiUrl}/api/v1/books/categories`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
})