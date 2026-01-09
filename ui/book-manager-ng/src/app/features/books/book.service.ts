import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book, Category, BookRequest } from '@shared/models/book.model';
import { tap, Observable, forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' }) // 定义服务（Service）的标准推荐方式,全自动的“单例模式”管理和极致的性能优化。
export class BookService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/books';

  // 使用 signal 管理图书列表状态
  private booksSignal = signal<Book[]>([]);
  // 暴露只读Signal给组件使用
  books = this.booksSignal.asReadonly();

  private categorySignal = signal<Category[]>([]);
  categories = this.categorySignal.asReadonly();

  /**
   * 从后端获取图书列表
   */
  fetchBooks() {
    return this.http.get<Book[]>(this.API_URL).pipe(tap((data) => this.booksSignal.set(data)));
  }

  fetchCategories() {
    return this.http
      .get<Category[]>(`${this.API_URL}/categories`)
      .pipe(tap((data) => this.categorySignal.set(data)));
  }

  getInitialData() {
    return forkJoin({
      books: this.http.get<Book[]>(this.API_URL),
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
        this.booksSignal.update((list) => list.filter((b) => b.id !== id));
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
