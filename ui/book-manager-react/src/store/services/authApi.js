import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({url: '/auth/authenticate', method: 'POST', body: credentials,}),
    }),
    getProfile: builder.query({
      query: () => '/users/profile', // 后端对应的获取当前登录用户信息的接口
    })
  }),
});

export const { useLoginMutation, useLazyGetProfileQuery } = authApi;
