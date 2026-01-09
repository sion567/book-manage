import { BookSchema, type Book } from '#shared/schemas/book'
import { z } from 'zod'

export const useBookService = () => {
  // const books = ref<Book[]>([]) 只在当前组件内有效。如果你在 A 页面 修改了它，B 页面 是感知不到的。
  // const books = useState<Book[]>('books') useState 是 Nuxt 框架特有的组合式函数（Composable），它是 Nuxt 为了解决 SSR（服务端渲染）状态同步问题而专门设计的。只要 key（即字符串 'books'）相同，Nuxt 就会确保所有组件访问的都是同一个数据源。

  // 使用 useAsyncData 封装查询，它能处理 SSR（服务端渲染）的数据同步、提供响应式的加载状态，并防止客户端重复请求。
  // useAsyncData 是为了“数据同步”：它的核心目标是在 页面加载时 把数据从服务器（SSR）同步到浏览器，并提供缓存和响应式状态。
  const fetchBooks = () => useAsyncData<Book[]>('books-list', async () => {
    const data = await useApi('/api/books')
    return z.array(BookSchema).parse(data)
  })

  /**
   * 获取分类列表
   */
  const fetchCategories = async () => {
    try {
      return await useApi<any[]>('/api/books/categories')
    }
    catch (error) {
      console.error('获取分类失败:', error)
      return []
    }
  }

  /**
   * 根据 ID 获取图书详情
   */
  const getBookById = (id: string | number) => {
    return useAsyncData<Book>(
      () => `book-${id}`,
      () => useApi<Book>(`/api/books/${id}`),
      { watch: [() => id] }, // 监听 ID 变化自动刷新
    )
  }

  const removeBook = async (id: number) => {
    if (!id) return
    await useApi(`/api/books/${id}`, { method: 'DELETE' })
    // 刷新数据（让 useAsyncData 重新请求最新列表）
    await fetchBooks()
  }

  return {
    fetchBooks,
    fetchCategories,
    getBookById,
    removeBook,
  }
}
