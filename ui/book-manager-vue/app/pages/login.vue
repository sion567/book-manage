<script setup lang="ts">
// 告诉 Nuxt：请把我的内容塞进 auth.vue 的 <slot /> 里
definePageMeta({
  layout: 'auth',
  // middleware: 'auth', //auth.ts将中间件改名为 auth.global.ts 后，不需要任何额外配置，它就会自动生效并应用于项目中的所有页面
})

const router = useRouter()
const credentials = reactive({ email: '', password: '' })
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  try {
    // 这里的 /api/auth/login 对应 server/api/auth/login.post.ts
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })

    if (!error.value) {
      // 成功后跳转到首页
      router.push('/')
    }
    else {
      alert('登录失败：' + error.value.data.message)
    }
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-center text-3xl font-extrabold text-gray-900">
      登录系统
    </h2>
    <form
      class="mt-8 space-y-6"
      @submit.prevent="handleLogin"
    >
      <div class="rounded-md shadow-sm -space-y-px">
        <input
          v-model="credentials.email"
          type="email"
          required
          placeholder="邮箱地址"
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
        <input
          v-model="credentials.password"
          type="password"
          required
          placeholder="密码"
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
      </div>

      <button
        :disabled="isLoading"
        type="submit"
        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
      >
        {{ isLoading ? '提交中...' : '立即登录' }}
      </button>

      <div class="text-sm text-center">
        <NuxtLink
          to="/register"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          没有账号？点击注册
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
