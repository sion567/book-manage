<script setup lang="ts">
const route = useRoute()

// 直接在 setup 顶层调用，Key 会随着 route.params.id 自动改变
// const { data: book, pending } = await useAsyncData<Book>(
//   `book-${route.params.id}`,
//   () => useApi(`/api/books/${route.params.id}`)
// )

const { getBookById } = useBookService()

// 从路由参数中获取 ID 并查询
const { data: book, pending } = await getBookById(route.params.id as string)

// 如果查询不到，可以显示 404
if (!pending.value && !book.value) {
  throw createError({ statusCode: 404, statusMessage: '书籍未找到' })
}
</script>

<template>
  <div v-if="book">
    <h1>{{ book.title }}</h1>
    <p>作者：{{ book.author }}</p>
    <p>出版年份：{{ book.publishedYear }}</p>
  </div>
</template>
