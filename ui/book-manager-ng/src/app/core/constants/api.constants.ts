export const API_ENDPOINTS = {
  AUTH: {
    BASE: '/api/v1/auth',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
  },
  USERS: {
    BASE: '/api/v1/users',
    PROFILE: '/api/v1/users/profile',
  },
  BOOKS: {
    BASE: '/api/v1/books',
    CATEGORY: '/api/v1/books/categories',
  }
} as const; // 使用 as const 保证类型安全且不可修改