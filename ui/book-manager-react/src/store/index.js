import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './services/authApi';

export const store = configureStore({
  reducer: {
    // 添加由 api 生成的 reducer
    [authApi.reducerPath]: authApi.reducer,
  },
  // 添加 api 中间件：这对于缓存、失效、轮询等功能至关重要
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
});
