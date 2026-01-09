<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Book } from '#shared/schemas/book'
// Nuxt 4 会自动导入 ref, computed, onMounted, onUnmounted 等

// 1. 初始化数据
const { data, pending, refresh } = await useAsyncData('init-data', async () => {
  const [books, categories] = await Promise.all([
    useApi<Book[]>('/api/books'),
    useApi<any[]>('/api/books/categories'),
  ])
  return { books, categories }
})

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
