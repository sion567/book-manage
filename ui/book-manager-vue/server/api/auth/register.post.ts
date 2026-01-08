import { z } from 'zod'
import { RegisterSchema } from '~~/shared/schemas/auth'

export default defineEventHandler(async (event) => {
  // 1. 获取请求体数据
  const body = await readBody(event) // Nitro 引擎提供的标准函数，用于异步解析请求体（JSON）
  const config = useRuntimeConfig()

  // 2. 后端二次校验（安全核心）
  // 即使前端校验过，后端也必须再次使用 RegisterSchema 校验，防止绕过前端的非法请求
  const result = RegisterSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: '校验失败',
      data: z.treeifyError(result.error) // 返回结构化的错误信息
    })
  }

  try {
    // 3. 将数据转发给真正的后端,可以使用 $fetch.raw 获取完整响应
    const { confirmPassword, ...data } = result.data //剔除掉 confirmPassword
    const response = await $fetch(`${config.public.apiUrl}/api/v1/auth/register`, {
      method: 'POST',
      body: data, // 转发经过校验的干净数据
      headers: {
        'Content-Type': 'application/json',
        // 如果需要，可以传递前端的原始 IP 或 User-Agent
        'X-Forwarded-For': getHeader(event, 'x-forwarded-for') || ''
      }
    })

    // 4. 返回 Spring Boot 的处理结果给前端
    return response

  } catch (error: any) {
    // 5. 错误捕获：处理 Spring Boot 返回的异常
    // 例如：用户名已存在 (409 Conflict) 或 后端宕机 (503)
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.message || '后端注册服务异常',
      data: error.data // 透传 Spring Boot 的具体错误详情
    })
  }
})