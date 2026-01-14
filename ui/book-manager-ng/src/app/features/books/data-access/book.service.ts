import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Book, Category, BookRequest } from './book.model';
import { Page } from '@shared/models/page.model';
import { tap, Observable, forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' }) // 定义服务（Service）的标准推荐方式,全自动的“单例模式”管理和极致的性能优化。
export class BookService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/books';

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
    return this.http.get<Page<Book>>(this.API_URL, { params }).pipe(tap((data) => this._booksPageSignal.set(data)));
    // .subscribe(...) —— “立即”执行动作
    // 适用场景：在组件的某个具体操作中（如点击按钮 onSearch()），你明确知道现在就要发请求并更新数据。
    // return this.http.get<Page<Book>>(this.API_URL, { params }).subscribe(res => this._booksPageSignal.set(res));
  }

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
    
    return this.http.get<Page<Book>>(this.API_URL, { params });
  }


  fetchCategories() {
    return this.http
      .get<Category[]>(`${this.API_URL}/categories`)
      .pipe(tap((data) => this._categorySignal.set(data)));
  }

  getInitialData() {
    return forkJoin({
      books: this.http.get<Page<Book>>(this.API_URL),
      categories: this.http.get<Category[]>('/api/categories'),
    });
  }

  /**
   * 删除图书
   */
  deleteBook(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
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
    return this.http.post<number>(this.API_URL, book);
  }

  updateBook(id: number, book: BookRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, book);
  }

  fetchBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}`);
  }
}
