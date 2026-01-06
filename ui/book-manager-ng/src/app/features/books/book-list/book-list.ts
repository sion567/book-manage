import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../book.service';
import { CurrencyPipe, DatePipe } from '@angular/common'; // 直接导入内置管道
import { LogPipe } from '@shared/pipes/log.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [LogPipe, CommonModule, FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList implements OnInit {
  private bookService = inject(BookService);

  // 搜索关键词信号
  searchQuery = signal('');

  // 派生状态：响应式过滤图书列表
  filteredBooks = computed(() => {
    const term = this.searchQuery().toLowerCase();
    return this.bookService
      .books()
      .filter((b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term));
  });

  ngOnInit() {
    // 初始加载数据
    this.bookService.fetchBooks().subscribe();
  }

  onDelete(id: number) {
    if (confirm('确认删除这本书吗？')) {
      this.bookService.deleteBook(id).subscribe();
    }
  }
}
