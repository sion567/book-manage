<script setup lang="ts">
import { z } from 'zod'
import { RegisterSchema, type RegisterInput } from '#shared/schemas/auth'

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

  // useFetch：是一个 组合式函数 (Composable)。它的设计初衷是用于 页面初始化 阶段（即在 setup 顶层直接运行），以便 Nuxt 能够处理服务端渲染 (SSR) 和数据水合。
  // $fetch：是一个 普通函数。它用于 交互触发 的场景（如点击按钮、提交表单、定时器轮询）。
  // const { error } = await useFetch('/api/auth/register', {
  //   method: 'POST',
  //   body: formData,
  // })
  // if (!error.value) {
  //   alert('注册成功！请登录')
  //   navigateTo('/login')
  // }

  try {
    const data = await $fetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    })
    alert('注册成功！请登录')
    navigateTo('/login')
  }
  catch (err) {
    console.log(err)
    alert('注册失败！')
  }
}
</script>

<template>
  <div>
    <h2>
      创建新账号
    </h2>
    <form @submit.prevent="handleRegister">
      <div>
        <input
          v-model="formData.firstname"
          type="text"
          required
          placeholder="姓"
        >
      </div>
      <div>
        <input
          v-model="formData.lastname"
          type="text"
          required
          placeholder="名"
        >
      </div>
      <div>
        <input
          v-model="formData.email"
          type="email"
          required
          placeholder="邮箱"
        >
        <span v-if="formErrors.email">
          {{ formErrors.email?.errors?.[0] }}
        </span>
      </div>
      <div>
        <input
          v-model="formData.password"
          type="password"
          required
          placeholder="设置密码"
        >
        <span v-if="formErrors.password">
          {{ formErrors.password?.errors?.[0] }}
        </span>
      </div>
      <div>
        <input
          v-model="formData.confirmPassword"
          type="password"
          required
          placeholder="确认密码"
        >
        <span v-if="formErrors.confirmPassword">
          {{ formErrors.confirmPassword?.errors?.[0] }}
        </span>
      </div>

      <button
        type="submit"
      >
        注册
      </button>
    </form>
  </div>
</template>
