// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/sitemap'],
  devtools: { enabled: true },
  site: {
    url: 'https://your-library-site.com',
  },
  runtimeConfig: {
    // 这里的 key 只能在 server/ 目录下访问（私密）
    springJwtSecret: 'default-secret-key',

    // 这里的 key 可以在 server/ 和 app/ 访问（公开）
    public: {
      apiUrl: 'http://localhost:8080',
    },
  },
  compatibilityDate: '2025-07-15',
  typescript: { strict: true },
  eslint: {
    // 开启后，在 npm run dev 开发时，如果有格式错误会直接在控制台和浏览器报错，依赖一个名为 vite-plugin-eslint2 的插件
    checker: true,
    // 自动配置项目风格（Nuxt 官方风格）
    config: {
      stylistic: true, // 开启格式化功能（缩进、引号等）
    },
  },
  sitemap: {
    // 告诉模块如何获取动态路由
    sources: [
      '/api/sitemap-urls', // 你可以创建一个简单的接口返回 URL 列表
    ],
  },
})
