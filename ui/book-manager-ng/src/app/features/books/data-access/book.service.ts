import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Book, Category, BookRequest } from './book.model';
import { Page } from '@shared/models/page.model';
import { tap, Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from '@core/constants/api.constants';

@Injectable({ providedIn: 'root' }) // 定义服务（Service）的标准推荐方式,全自动的“单例模式”管理和极致的性能优化。
export class BookService {
  private http = inject(HttpClient);

/*
场景： 全局状态、跨页面共享的数据、需要持久化的缓存。
Service 作为“状态仓库/Store”（推荐用于简单应用或全局状态）
在这种模式下，Service 是有状态（Stateful）的，充当了一个轻量级的 Store。
做法：booksPageSignal 定义在 Service 中，并暴露一个只读版本。
signal是主动控制的变量，创建一个可写信号，通过 .set()、.update() 或 .mutate() 直接修改它的值
*/
  
  private _booksPageSignal = signal<Page<Book> | null>(null); // 使用 signal 管理图书列表状态
  public booksPage = this._booksPageSignal.asReadonly(); // 暴露只读Signal给组件使用
  private _categorySignal = signal<Category[]>([]);
  public categories = this._categorySignal.asReadonly();

  /**
   * 从后端获取图书列表
   */
  fetchBooks(page: number, size: number) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    // pipe(tap(...)) —— 只是“预设”副作用
    // 它是惰性的（Lazy）：这段代码本身不会发送 HTTP 请求。它只是在管道里放了一个“监听器”。
    // 什么时候触发？：只有当外部有人 .subscribe() 这个方法返回的 Observable，或者在模板里用了 | async 管道时，tap 里的 set(data) 才会执行。
    return this.http.get<Page<Book>>(`${API_ENDPOINTS.BOOKS.BASE}`, { params }).pipe(tap((data) => this._booksPageSignal.set(data)));
    // .subscribe(...) —— “立即”执行动作
    // 适用场景：在组件的某个具体操作中（如点击按钮 onSearch()），你明确知道现在就要发请求并更新数据。
    // return this.http.get<Page<Book>>(this.API_URL, { params }).subscribe(res => this._booksPageSignal.set(res));
  }

  fetchCategories() {
    return this.http
      .get<Category[]>(`${API_ENDPOINTS.BOOKS.CATEGORY}`)
      .pipe(tap((data) => this._categorySignal.set(data)));
  }
// 在 Angular 中，使用 .pipe(tap(...)) 是一种“透明监听”模式：
// 保持响应式：它依然返回一个 Observable，外部调用者可以继续链式调用。
// 副作用分离：tap 的含义是“我想在数据流过时顺便做点事（设置 Signal），但不改变数据本身”。
// 现在的开发模式倾向于 “数据源 -> 操作符 -> Signal/模板” 的单向流动。使用 .pipe 可以让你在 Service 层定义好数据流向，而不需要提前触发（subscribe）它。
// 总结：
// 不用 .pipe，你就必须立即 .subscribe()。这会导致你的方法从“提供数据源”变成了“直接执行动作”，降低了代码的灵活性。
// 现在的趋势是：逻辑留在 .pipe() 里，订阅交给框架（AsyncPipe 或 Signals）。
// AsyncPipe（在模板中写作 | async）是一个内置的自动管家。它的作用是：在 HTML 模板中直接处理 Promise 或 Observable，并自动帮你订阅和取消订阅。




// 1. 什么是订阅 (Subscribe)？
// 当你执行 http.get 时，Angular 并没有立刻发出请求。它只是创建了一个“计划”（Observable）。
// 动作：只有当你调用 .subscribe() 时，这个“计划”才正式启动。
// 结果：一旦订阅成功，数据就像报纸一样，只要有更新（或者请求返回了），就会通过回调函数送到你手上。
// 2. 什么是取消订阅 (Unsubscribe)？
// “取消订阅”就是告诉程序：“别再给我发报纸了，我搬家了（组件销毁了）。”
// 为什么要取消？
// 如果你的组件已经关闭了（比如用户跳到了别的页面），但订阅还在运行，这就是内存泄漏。
// 后果：程序会尝试在已经不存在的页面上更新数据，导致报错，或者让电脑越来越卡。

// // 1. 保存订阅引用
// private mySub: Subscription;

// ngOnInit() {
//   this.mySub = this.http.get(...).subscribe();
// }

// // 2. 在组件销毁时断开连接
// ngOnDestroy() {
//   this.mySub.unsubscribe(); 
// }




  /**
   * Service 只负责返回 Observable，不持有状态，也不使用 tap
   * 使用 toSignal 配合 switchMap 驱动分页，彻底消除 tap 和手动 subscribe
   * @param page 
   * @param size 
   * @returns 
   */
  fetchBooksV2(page: number, size: number): Observable<Page<Book>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Book>>(`${API_ENDPOINTS.BOOKS.BASE}`, { params });
  }

  fetchCategoriesV2(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_ENDPOINTS.BOOKS.CATEGORY}`);
  }

  getInitialData() {
    return forkJoin({ // forkJoin 的特性是：任何一个流报错，整个结果都会失败。 建议为每个请求添加 catchError。
      books: this.http.get<Page<Book>>(`${API_ENDPOINTS.BOOKS.BASE}`).pipe(
        catchError(error => {
          console.error('书籍加载失败', error);
          return of({ content: [], totalElements: 0 }); // 返回默认分页结构
        })
      ),
      categories: this.http.get<Category[]>(`${API_ENDPOINTS.BOOKS.CATEGORY}`).pipe(
        catchError(error => {
          console.error('分类加载失败', error);
          return of([]); // 返回空数组防止模板报错
        })
      )
    });
  }
// // 在 Component 中
// data$ = this.service.getInitialData();
// 在 Angular 和 RxJS 开发中，这种在变量名末尾加上 $ 符号的命名方式被称为 “芬兰式表示法” (Finnish Notation)。
// data: 通常表示一个静态对象、数组或基础类型。你可以直接访问 data.id。
// data$: 表示这是一个 Observable（可观察对象）。你不能直接访问它的属性，必须通过 .subscribe() 或在 HTML 中使用 | async 管道来获取值。
// 这种命名方式由核心开发者 Andre Staltz（RxJS 社区的大牛）推广。因为他来自芬兰，所以社区将其戏称为“芬兰式表示法”。虽然它不是 TypeScript 或 JavaScript 的强制语法，但它已成为 Angular 社区事实上的标准。

/**
   * 删除图书
   */
  deleteBook(id: number) {
    return this.http.delete(`${API_ENDPOINTS.BOOKS.BASE}/${id}`).pipe(
      tap(() => {
        // 成功后更新本地 signal，实现无刷新 UI 更新
        this._booksPageSignal.update((currentPageState) => {
          // 如果数据还没加载或为空，直接返回
          if (!currentPageState) return currentPageState;

          return {
            ...currentPageState,
            // 过滤掉删除的那一行
            content: currentPageState.content.filter((b) => b.id !== id),
            // 记得同步减少总计数，否则分页组件显示的数字会错误
            totalElements: currentPageState.totalElements - 1,
            // 可选：如果是该页最后一条，可能需要更复杂的逻辑（如自动跳回上一页）
          };
        });
      }),
    );
  }

  createBook(book: BookRequest): Observable<number> {
    return this.http.post<number>(`${API_ENDPOINTS.BOOKS.BASE}`, book);
  }

  updateBook(id: number, book: BookRequest): Observable<void> {
    return this.http.put<void>(`${API_ENDPOINTS.BOOKS.BASE}/${id}`, book);
  }

  fetchBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${API_ENDPOINTS.BOOKS.BASE}/${id}`);
  }
}
