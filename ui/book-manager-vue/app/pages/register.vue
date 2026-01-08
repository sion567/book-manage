<script setup lang="ts">
import { z } from 'zod'
import { RegisterSchema, type RegisterInput } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })

const formData = reactive<RegisterInput>({
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'USER',
})

// 使用 Partial 允许初始为空，结构与 RegisterInput 保持一致
// const formErrors = ref<Partial<Record<keyof RegisterInput, string>>>({})
const formErrors = ref<Record<string, any>>({})

// async function handleRegister(formData: RegisterInput) { // function 声明，提升 (Hoisting)，文件内部直接定义并使用这个函数，可以不带参数
const handleRegister = async () => { // const 箭头函数
  const result = RegisterSchema.safeParse(formData)
  if (!result.success) {
    formErrors.value = z.treeifyError(result.error).properties || {}
    return
  }
  formErrors.value = {}

  const { error } = await useFetch('/api/auth/register', {
    method: 'POST',
    body: formData,
  })

  if (!error.value) {
    alert('注册成功！请登录')
    navigateTo('/login')
  }
}
</script>

<template>
  <div>
    <h2 class="text-center text-3xl font-extrabold text-gray-900">
      创建新账号
    </h2>
    <form
      class="mt-8 space-y-4"
      @submit.prevent="handleRegister"
    >
      <div>
        <input
          v-model="formData.firstname"
          type="text"
          required
          placeholder="姓"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <input
          v-model="formData.lastname"
          type="text"
          required
          placeholder="名"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <input
          v-model="formData.email"
          type="email"
          required
          placeholder="邮箱"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
        <span v-if="formErrors.email" class="text-red-500">
          {{ formErrors.email?.errors?.[0] }}
        </span>
      </div>
      <div>
        <input
          v-model="formData.password"
          type="password"
          required
          placeholder="设置密码"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <input
          v-model="formData.confirmPassword"
          type="password"
          required
          placeholder="确认密码"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
        <span v-if="formErrors.confirmPassword" class="text-red-500">
          {{ formErrors.confirmPassword?.errors?.[0] }}
        </span>
      </div>

      <button
        type="submit"
        class="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        注册
      </button>

      <p class="text-center text-sm">
        <NuxtLink
          to="/login"
          class="text-blue-600"
        >返回登录</NuxtLink>
      </p>
    </form>
  </div>
</template>
