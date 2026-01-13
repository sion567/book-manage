<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Book } from '#shared/schemas/book'
// Nuxt 4 会自动导入 ref, computed, onMounted, onUnmounted 等

// https://nuxt.com.cn/docs/4.x/guide/concepts/rendering/

// ❌ 错误示范：会导致服务器请求一次，浏览器水合又请求一次，浪费资源
// const data = await $fetch('/api/xxx') 

// 1. 初始化数据
// 第一个参数 'init-data'(key) 是唯一标识。Nuxt 会缓存请求结果，确保在生命周期内相同的请求只执行一次，避免在客户端和服务器端重复抓取
// 服务器端渲染 (SSR) 友好： Nuxt 会在服务端获取数据，并将其序列化（Hydration）到前端，避免页面加载时出现“闪烁”或二次请求
const { data, refresh } = await useAsyncData('init-data', async () => {
  const [books, categories] = await Promise.all([
    useApi<Book[]>('/api/books'),
    useApi<any[]>('/api/books/categories'),
  ])
  return { books, categories }
})
// 写法 A：useFetch，效果等同于 useAsyncData，但不需要写 handler 函数
// 只是想请求一个 URL 接口，useFetch 是 useAsyncData 的语法糖
// const { data, pending } = await useFetch('/api/xxx', {
//   method: 'GET',
//   query: { id: 1 }
// })

// 写法 B：非阻塞式写法 (Lazy): 不希望数据请求阻塞页面跳转，可以使用 Lazy 前缀
// 页面会先跳转，data 初始为 null，pending 为 true
// const { data } = await useLazyAsyncData('key', () => $fetch('/api/data'))
// 或者使用 useFetch 的 lazy 选项
// const { data } = await useFetch('/api/data', { lazy: true })

// 写法 C：直接使用 $fetch（不推荐在初始化时使用）。适用场景： 仅用于用户交互触发的事件（如点击按钮提交表单）
// 如果你在组件初始化时（如 setup 中）直接写 const data = await $fetch(...)，会导致重复请求：服务端跑一次，客户端水合时又跑一次。



const authStore = useAuthStore()
// 使用 storeToRefs 提取响应式数据
const { user } = storeToRefs(authStore)

// 1. 响应式数据状态
// const books = ref<Book[]>([])
// const categories = ref<any[]>([])
// const bookService = useBookService() // 获取图书服务逻辑
// const fetchData = async () => {
//   try {
//     const [booksRes, categoriesRes] = await Promise.all([
//       bookService.fetchBooks(),
//       bookService.fetchCategories(),
//     ])
//     books.value = booksRes as Book[]
//     categories.value = categoriesRes as any[]
//   }
//   catch (error) {
//     console.error('数据刷新失败:', error)
//   }
// }
// 计算属性
// const totalBooks = computed(() => books.value.length)
// const totalCategories = computed(() => categories.value.length)

let timer: number | null = null

// 4. 生命周期管理：开启 5 秒轮询
onMounted(() => {
  // fetchData() // 立即执行一次
  timer = setInterval(() => {
    console.log('正在定时刷新数据...')
    refresh()
  }, 5000)
})

// 5. 销毁定时器防止内存泄漏
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="dashboard-container">
    <header>
      <h1>🚀 控制台</h1>
      <div class="user-info">
        <!-- v-if 替代 @if -->
        <template v-if="user">
          <span>欢迎回来, <strong>{{ user.firstname }}</strong>!</span>
        </template>
      </div>
    </header>

    <main class="stats-grid">
      <div class="stat-card">
        <h3>图书总数</h3>
        <p class="big-number">
          {{ data?.books.length }}
        </p>
        <NuxtLink
          to="/books"
          active-class="active"
        >查看全部 →</NuxtLink>
      </div>

      <div class="stat-card">
        <h3>分类数量</h3>
        <p class="big-number">
          {{ data?.categories.length }}
        </p>
      </div>

      <div class="stat-card">
        <h3>系统状态</h3>
        <p class="status-tag">
          运行中
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}
.big-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1976d2;
  margin: 0;
}
.status-tag {
  color: #2e7d32;
  font-weight: bold;
}
.active {
  color: #1976d2;
  text-decoration: underline;
}
</style>
