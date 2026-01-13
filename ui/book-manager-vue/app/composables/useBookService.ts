import { BookSchema, type Book } from '#shared/schemas/book'
import { z } from 'zod'

// 根据 Vue 官方建议，所有 Composables（组合式函数） 都应该以 use 开头。
export const useBookService = () => {
  // const books = ref<Book[]>([]) 只在当前组件内有效。如果你在 A 页面 修改了它，B 页面 是感知不到的。
  // const books = useState<Book[]>('books') useState 是 Nuxt 框架特有的组合式函数（Composable），它是 Nuxt 为了解决 SSR（服务端渲染）状态同步问题而专门设计的。只要 key（即字符串 'books'）相同，Nuxt 就会确保所有组件访问的都是同一个数据源。

  // 使用 useAsyncData 封装查询，它能处理 SSR（服务端渲染）的数据同步、提供响应式的加载状态，并防止客户端重复请求。
  // useAsyncData 是为了“数据同步”：它的核心目标是在 页面加载时 把数据从服务器（SSR）同步到浏览器，并提供缓存和响应式状态。
  // useAsyncData 作为最外层的管理器，负责 Nuxt 的 SSR 缓存和水合逻辑；$fetch 作为内部的执行器，只负责单纯的网络请求
  const useBooks = () => useAsyncData<Book[]>('books-list', async () => {
    try {
      return await useApi('/api/books')
    }
    catch (error) {
      console.error('获取失败:', error)
      return []
    }
    
  })

  const useBooksTotal = () => useAsyncData('books-total', async () => {
    const data = await $fetch<any>('/api/books', {
      query: { size: 1 },
    })
    return data.totalElements as number
  })

  const useLazyBooks = (page: Ref<number>) => { // 利用自动推导,删掉 useAsyncData 后面的泛型。因为你已经用了 Zod，TypeScript 能够自动通过 z.parse 的结果推导出正确的类型
    // return useAsyncData<Book[]>(
    return useAsyncData(
      `book-list-${page.value}`, // 第一个参数：必须是静态字符串 (Key)
      async () => {
        const data = await useApi('/api/books', {
          query: { page: page.value - 1, size: 10 }
        })
        return {
          list: z.array(BookSchema).parse(data),
          total: data.totalElements
        }
      }, // 第二个参数：必须是 async 函数
      { watch: [page], lazy: true }, // 第三个参数：配置项
    )
  }

  /**
   * 根据 ID 获取图书详情
   */
  const useBook = (id: MaybeRefOrGetter<string | number>) => {
    return useAsyncData<Book>(
      () => `book-${id}`,
      () => useApi<Book>(`/api/books/${toValue(id)}`),
      { watch: [() => id] }, // 监听 ID 变化自动刷新
    )
  }

  const removeBook = async (id: number) => {
    if (!id) return
    await useApi(`/api/books/${id}`, { method: 'DELETE' })
    // 刷新数据（让 useAsyncData 重新请求最新列表）
    await useBooks()
  }

  return {
    useBooks,
    useBooksTotal,
    useLazyBooks,
    useBook,
    removeBook,
  }
}
