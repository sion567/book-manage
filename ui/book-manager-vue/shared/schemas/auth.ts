import { z } from 'zod'

export const RegisterSchema = z.object({
  firstname: z.string().min(1, '用户名至少1个字符'),
  lastname: z.string().min(1, '用户名至少1个字符'),
  email: z.email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(8, '密码至少8位'),
  confirmPassword: z.string().min(8, '请再次输入密码'),
  role: z.enum(['USER']).default('USER')
})
  .refine(data => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'], // 关键：这会让错误信息挂在 confirmPassword 字段上
  })

export type RegisterInput = z.infer<typeof RegisterSchema>


export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export type LoginInput = z.infer<typeof LoginSchema>


export const UserProfileSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER'])
})
export type UserProfile = z.infer<typeof UserProfileSchema>