// import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
// import { rxMethod } from '@ngrx/signals/rxjs-interop';

// export const BookStore = signalStore(
//   { providedIn: 'root' }, // 也可以不写，在组件级注入
//   withState({
//     booksPage: { content: [], totalElements: 0 } as Page<Book>,
//     isLoading: false,
//     filterText: ''
//   }),
//   withComputed((state) => ({
//     // 这里写派生逻辑
//     totalBooks: computed(() => state.booksPage().totalElements)
//   })),
//   withMethods((store, bookService = inject(BookService)) => ({
//     // 使用 rxMethod 处理异步加载
//     loadBooks: rxMethod<{ page: number; size: number }>(pipe(
//       tap(() => patchState(store, { isLoading: true })),
//       switchMap((query) => bookService.getBooks(query.page, query.size).pipe(
//         tap((res) => patchState(store, { booksPage: res, isLoading: false }))
//       ))
//     ))
//   }))
// );