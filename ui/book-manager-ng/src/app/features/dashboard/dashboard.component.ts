import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap, timer, switchMap, forkJoin } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { BookService } from '@features/books/data-access/book.service';
import { Book } from '@features/books/data-access/book.model';
import { Page } from '@shared/models/page.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // 推荐将所有 UI 逻辑放在 template 块中，简单直观
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export default class DashboardComponent {
  // 注入服务
  private authService = inject(AuthService);
  private bookService = inject(BookService);

  // 使用 Signal 映射数据
  // user() 会自动从 AuthService 的 currentUser Signal 获取最新值
  user = this.authService.currentUser;

  // 每 5 秒触发一次请求 (0 表示立即开始，5000 表示间隔)
  private refresh$ = timer(0, 5000);

//Code Smell
// Service 里的signal已经有值,组件里的 categories() 信号也有值了

  // 1. 获取图书数据并转为 Signal
  books = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.bookService.fetchBooks(0, 1))
    ),
    {
      initialValue: {
        content: [],
        totalElements: 0,
        totalPages: 0
      } as Page<Book> 
    }
  );

  // 2. 获取分类数据并转为 Signal
  categories = toSignal(
    this.refresh$.pipe(switchMap(() => this.bookService.fetchCategories())),
    { initialValue: [] }
  );

// 在 RxJS 中，switchMap 的核心作用是 “切换”：当有新的数据发出时，它会自动取消（退订）上一个尚未完成的流，并开启一个新的流。
// 它是处理 “竞态条件 (Race Condition)” 的神器，在 2026 年的 Angular 开发中，它是处理搜索、详情切换等功能的第一选择。
// 想拿最新结果，放弃旧的 -> switchMap
// 想按顺序一个一个来 -> concatMap
// 想先执行完，不理会新的 -> exhaustMap 


 // 方案二. 定义轮询流
  // private data$ = timer(0, 5000).pipe(
  //   switchMap(() => 
  //     // forkJoin 作用等同于 Promise.all
  //     forkJoin({
  //       books: this.bookService.fetchBooks(),
  //       categories: this.bookService.fetchCategories()
  //     })
  //   )
  // );


  // 3. 使用 computed 计算图书总数（派生状态） (当 books 或 categories 变化时自动更新)
  totalBooks = computed(() => this.books().totalElements);
  totalCategories = computed(() => this.categories().length);
}
