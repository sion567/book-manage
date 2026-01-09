export default defineNuxtRouteMiddleware((to, from) => {
  // 1. 获取用户登录状态（通常从 Pinia 或 Cookie 中获取）
  const auth = useAuthStore()

  // 1. 白名单：排除登录、注册
  const publicPages = ['/login', '/register']
  if (publicPages.includes(to.path)) {
    return
  }

  /**
   * 逻辑判断：
   * 如果用户未登录（Store 里没用户且 Cookie 里没 Token），
   * 且当前要去往的页面不是登录页，则重定向。
   */
  if (!auth.user) {
    // 特别注意：不要拦截登录页本身，否则会死循环
    if (to.path !== '/login') {
      // 使用 navigateTo 进行重定向
      // replace: true 确保用户点击返回键时不会回到被拦截的页面
      return navigateTo({
        path: '/login',
        query: {
          // 记录用户原本想去的页面，方便登录成功后跳回来
          callback: to.fullPath,
        },
      }, { replace: true })
    }
  }
})
