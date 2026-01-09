<script setup lang="ts">
const authStore = useAuthStore()
const { initAuth } = authStore

// 在应用挂载前尝试恢复登录状态
// 确保 initAuth 在 SSR 期间执行一次，
// 且客户端水合（Hydration）时完全跳过，直接复用服务器端修改后的 Pinia 状态。
await callOnce(async () => {
  console.log('[SSR/Client] 该逻辑在应用生命周期内只执行一次')
  await initAuth()
})
</script>

<template>
  <!-- NuxtLayout 会自动包裹 NuxtPage -->
  <!-- 它会自动寻找 layouts/ 目录下的 default.vue -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
