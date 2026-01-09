import { z } from 'zod'

// 定义校验规则（Schema）
export const BookSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, '书名不能为空').max(100),
  author: z.string().min(1, '作者不能为空'),
  publishedYear: z.number().int().min(1900).max(2026),
})

// 从 Schema 自动推导出 TypeScript 类型（Type）
export type Book = z.infer<typeof BookSchema>
