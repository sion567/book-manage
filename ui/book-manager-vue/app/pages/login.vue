<script setup lang="ts">
// 告诉 Nuxt：请把我的内容塞进 auth.vue 的 <slot /> 里
// definePageMeta({
//  layout: 'auth',
//   middleware: 'auth', //auth.ts将中间件改名为 auth.global.ts 后，不需要任何额外配置，它就会自动生效并应用于项目中的所有页面
// })
const authStore = useAuthStore()
const credentials = reactive({ email: '', password: '' })
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  try {
    await authStore.login(credentials)
    // router.push('/') // 有时在异步请求（如 $fetch）的回调中会丢失上下文。
    navigateTo('/', { replace: true })
  }
  catch (err) {
    console.error('登录处理失败:', err)
    alert('登录失败！')
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <input
        v-model="credentials.email"
        type="email"
        required
        placeholder="邮箱地址"
      ><br>
      <input
        v-model="credentials.password"
        type="password"
        required
        placeholder="密码"
      ><br>

      <button
        :disabled="isLoading"
        type="submit"
      >
        {{ isLoading ? '提交中...' : '立即登录' }}
      </button>
    </form>
  </div>
</template>
