// src/app/features/books/book.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '@shared/models/book.model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/books';

  // 使用 signal 管理图书列表状态
  private booksSignal = signal<Book[]>([]);
  // 暴露只读Signal给组件使用
  books = this.booksSignal.asReadonly();

  /**
   * 从后端获取图书列表
   */
  fetchBooks() {
    return this.http.get<Book[]>(this.API_URL).pipe(
      tap(data => this.booksSignal.set(data))
    );
  }

  /**
   * 删除图书
   */
  deleteBook(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // 成功后更新本地 signal，实现无刷新 UI 更新
        this.booksSignal.update(list => list.filter(b => b.id !== id));
      })
    );
  }

  fetchBookById(id: number) {
    return this.http.get<Book>(`${this.API_URL}/${id}`); 
  }
}
