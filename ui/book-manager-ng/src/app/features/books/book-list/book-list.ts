import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common'; // 直接导入内置管道
import { LogPipe } from '@shared/pipes/log.pipe';
import { RouterLink } from '@angular/router';
import { BookService } from '../data-access/book.service';
import { Book } from '../data-access/book.model';
import { Page } from '@shared/models/page.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [LogPipe, CommonModule, FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList implements OnInit {
  private bookService = inject(BookService);

/*
场景： 页面私有状态、仅供当前组件及其子组件使用的临时数据。
  // 1. 定义源信号：分页参数
  // 只要这个信号改变，下方的数据流就会自动重新跑
  currentPage = signal(0);
  pageSize = signal(10);
  // 2. 将参数信号转换为 Observable
  // 消除 subscribe 的关键。我们创建一个 query 信号，一旦它改变，toSignal 内部会自动触发新的请求
  private query$ = toObservable(computed(() => ({
    page: this.currentPage(),
    size: this.pageSize()
  })));
  // 3. 核心：使用 switchMap 驱动数据转换
  // toSignal 会自动处理订阅 (subscribe) 和组件销毁时的取消订阅。将异步流（RxJS）桥接到信号世界的“只读窗口”
  private pagedResponse = toSignal(
    this.query$.pipe(
      switchMap(q => this.bookService.fetchBooksV2(q.page, q.size))
    ),
    { 
      initialValue: { content: [], totalElements: 0 } as unknown as Page<Book> 
    }
  );
  // 4. 衍生信号：供模板方便使用
  books = computed(() => this.pagedResponse().content);
  total = computed(() => this.pagedResponse().totalElements);

  // 操作方法：只需改变源信号的值
  nextPage() {
    this.currentPage.update(p => p + 1); <button (click)="nextPage()">下一页</button>
  }

// 优点：
// 1. 无手动订阅 (No .subscribe())：toSignal 在组件挂载时自动订阅，销毁时自动取消，彻底避免内存泄漏。
// 2. 无副作用 (No tap)：数据流是单向的。pagedResponse 的状态完全取决于 query$ 的变化，逻辑非常清晰。
// 3. 自动处理竞态条件 (switchMap)：如果用户疯狂点击“下一页”，switchMap 会自动取消掉之前还没返回的请求，只保留最后一次请求，保证数据一致性。
// 4. 精细化渲染：由于使用了 Signal，Angular 能够精确知道 books 发生了变化，只更新 DOM 中受影响的部分，性能极佳。

Observable 是惰性的（Lazy），就像一辆加满油但没点火的车。.subscribe() 的本质作用就是“点火”。
如果没有 subscribe，任何数据流都不会开始运行。
在 Angular 引入 async 管道和 toSignal 之前，subscribe 是唯一能让数据从 Service 流向 Component 的方法。
在纯函数式编程中，我们希望数据只是流转。但现实开发中，我们总需要一些“副作用”，比如：
a.弹出一个通知。
b.手动操作 DOM（虽然不推荐）。
c.将数据打印到控制台。
d.手动赋值给变量。
.subscribe() 就是为了给这些“必须发生的操作”提供一个出口。
随着应用变得复杂，手动 subscribe 暴露了三个核心弊端：
a.内存泄漏（Memory Leaks）：如果你订阅了却忘记在组件销毁时取消订阅（unsubscribe），那个监听器会一直留在内存里，甚至在页面跳转后还在运行。
b.嵌套地狱（Pyramid of Doom）：当你需要先请求用户 ID，再根据 ID 查订单时，如果不使用 switchMap 而是嵌套 subscribe，代码会变得极其难以维护。
c.状态同步困难：手动在 subscribe 内部给变量赋值（如 this.data = res），本质上是把响应式代码变回了命令式代码，这违背了 Angular 想要实现的“声明式渲染”愿景。

.subscribe() 是底层的手动挡。在 Angular 17/18/19+ 的 Signal 时代，我们有了 toSignal 这种自动挡，它更安全、更省心，所以我们才建议在处理页面状态时“弃手动，换自动”。

*/

  // 搜索关键词信号
  searchQuery = signal('');

  // 派生状态：响应式过滤图书列表
  filteredBooks = computed(() => {
    const term = this.searchQuery().toLowerCase();
    const pageData = this.bookService.booksPage();
    if (!pageData || !pageData.content) {
      return [];
    }
    return pageData.content.filter((b) => 
      b.title.toLowerCase().includes(term) || 
      b.author.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    // 初始加载数据
    this.bookService.fetchBooks(0, 10).subscribe();
  }

  onDelete(id: number) {
    if (confirm('确认删除这本书吗？')) {
      this.bookService.deleteBook(id).subscribe();
    }
  }
}
