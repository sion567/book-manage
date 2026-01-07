import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const bookApi = createApi({
  reducerPath: 'bookApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  endpoints: (builder) => ({
    getBooks: builder.query({ query: () => '/books' }),
  }),
});

export const { useGetBooksQuery } = bookApi;


// 在组件中只需调用 Hook
// const { data, error, isLoading } = useGetBooksQuery();

// if (isLoading) return <Spinner />; // 自动处理加载中
// if (error) return <Error />;      // 自动处理错误
// return <List data={data} />;       // 数据拿到直接用