<script setup lang="ts">
// Nuxt 4 自动注入 error 对象的类型
const props = defineProps({
  error: Object as any,
})

// 点击返回首页并清除错误状态
const handleError = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
    <div class="text-center">
      <!-- 错误状态码 -->
      <h1 class="text-9xl font-bold text-blue-600 mb-4">
        {{ error.statusCode || '500' }}
      </h1>

      <!-- 错误消息 -->
      <h2 class="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
        {{ error.statusCode === 404 ? '哎呀！找不到这个页面' : '系统出现了一点小问题' }}
      </h2>

      <!-- 详细描述（仅开发环境或调试时显示） -->
      <p class="text-gray-500 mb-8 max-w-md mx-auto">
        {{ error.message || '请尝试刷新页面或联系管理员。' }}
      </p>

      <!-- 操作按钮 -->
      <button
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        @click="handleError"
      >
        返回主页
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 如果你没有安装 Tailwind CSS，可以添加以下简单样式 */
h1 {
  font-family: sans-serif;
}
</style>
