<script setup lang="ts">
import type { Book } from '#shared/schemas/book'

const { fetchBooks, removeBook } = useBookService()

/*
const {
  data: books,    // 响应式的书籍数组
  pending,        // 布尔值，表示是否正在加载
  error,          // 错误对象
  refresh         // 一个函数，调用它可以重新触发查询
} = await useAsyncData<Book[]>('books-list', () => useApi('/api/books'))
*/

const { data: books, pending, error, refresh } = fetchBooks()

/*
Pinia 的 Store 在 Nuxt 中会自动导入，你可以直接在页面中调用。
// 自动导入 useBookStore
const bookStore = useBookStore()
// 使用 storeToRefs 保持状态的响应式，同时解构方法
const { books, isLoading, totalBooks } = storeToRefs(bookStore)
const { fetchBooks, removeBook } = bookStore
// 使用 useAsyncData 配合 Pinia 确保 SSR 数据同步
await useAsyncData('books-init', () => fetchBooks())
*/
</script>

<template>
  <div>
    <button
      :disabled="pending"
      @click="() => refresh()"
    >
      刷新列表
    </button>

    <div v-if="pending">
      加载中...
    </div>
    <div v-else-if="error">
      加载失败：{{ error.message }}
    </div>

    <ul v-else>
      <li
        v-for="book in books"
        :key="book.id"
      >
        {{ book.title }} - {{ book.author }}
        <NuxtLink :to="`/books/${book.id}`">查看详情</NuxtLink>
        <button
          @click="() => removeBook(book.id!)"
        >
          删除
        </button>
      </li>
    </ul>
  </div>
</template>
