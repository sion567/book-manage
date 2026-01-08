BFF (Backend For Frontend，为前端服务的后端)

npx nuxi@latest init book-manager-vue
npm install pinia @pinia/nuxt
npm install zod

如何 TypeScript 的类型定义没有更新。请按照以下步骤解决：
生成开发目录：在终端运行 npx nuxi prepare。这会重新生成 .nuxt 目录下的类型文件。

npx nuxi@latest module add sitemap

// 代码格式化
npx nuxi module add eslint
npm install -D vite-plugin-eslint2
npx eslint . --fix

useFetch('/api/auth/login') 意味着什么？
如果你创建了 server/api/auth/login.post.ts：
请求流向：浏览器 -> Nuxt Server (login.post.ts) -> Spring Boot。
用途：你可以在 Nuxt 这层对数据进行加工。

如果你配置了 routeRules 代理：
请求流向：浏览器 -> Nuxt Server (自动转发) -> Spring Boot。
用途：简单快捷，纯透传。

export default defineNuxtConfig({
  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:8080/api/**' // 所有 /api 开头的请求直接转发
    }
  }
})

如果你什么都没配，也没写文件：
Nuxt 会报 404，因为它在自己的 server/ 目录下找不到处理这个请求的逻辑。

开发环境：
npm run dev
生产环境：
npm run build
node .output/server/index.mjs
建议配合 PM2 管理进程
pm2 start .output/server/index.mjs --name "web-ui"

*只有带 NUXT_PUBLIC_ 前缀的变量才能在浏览器（Vue 页面）里访问。不带 PUBLIC 的变量（如 NUXT_SESSION_PASSWORD）只能在 server/ 目录下通过 useRuntimeConfig() 读到
