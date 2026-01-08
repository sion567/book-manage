// import { appendFileSync } from 'node:fs'

export default defineEventHandler((event) => {
  const start = Date.now()
  const { method, url } = event.node.req

  // 仅监控 API 请求，跳过静态资源（如 .png, .css）
  if (!url?.startsWith('/api')) return

  // 响应结束时的回调
  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode
    const timestamp = new Date().toISOString()

    // 终端控制台彩色输出（本地开发调试）
    const color = status >= 400 ? '\x1b[31m' : '\x1b[32m' // 红/绿
    console.log(`${color}[${timestamp}] ${method} ${url} - ${status} (${duration}ms)\x1b[0m`)

    // 可以将日志写入文件或发送至日志服务器
    // 实际项目中建议使用 pino 或 winston
    // appendFileSync('server.log', `[${timestamp}] ${method} ${url} ${status} ${duration}ms\n`) // 示例：写入本地文件
  })
})
