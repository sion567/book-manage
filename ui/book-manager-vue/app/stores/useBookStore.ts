import { defineStore } from 'pinia'
import type { Book } from '#shared/types/book'

export const useBookStore = defineStore('book', () => {
  // 1. 状态 (State)
  const books = ref<Book[]>([])
  const isLoading = ref(false)

  // 2. 计算属性 (Getters)
  const totalBooks = computed(() => books.value.length)
  const getBookById = (id: number) => books.value.find(b => b.id === id)

  // 3. 动作 (Actions) - 集中处理 CRUD 逻辑
  const fetchBooks = async () => {
    isLoading.value = true
    try {
      // 这里的 useApi 是你之前的封装
      const data = await useApi<Book[]>('/api/books')
      books.value = data
    }
    finally {
      isLoading.value = false
    }
  }

  const addBook = async (book: Book) => {
    await useApi('/api/books', { method: 'POST', body: book })
    await fetchBooks() // 重新刷新列表
  }

  const removeBook = async (id: number) => {
    await useApi(`/api/books/${id}`, { method: 'DELETE' })
    books.value = books.value.filter(b => b.id !== id) // 也可以本地过滤，减少一次请求
  }

  // 必须返回
  return {
    books,
    isLoading,
    totalBooks,
    fetchBooks,
    addBook,
    removeBook,
  }
})
