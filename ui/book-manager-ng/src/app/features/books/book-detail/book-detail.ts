import { Component, inject, input, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../book.service';
import { Book } from '@shared/models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.scss'
})
export class BookDetail implements OnInit {
  private bookService = inject(BookService);
  
  // 通过路由配置直接将 :id 映射为 input 信号
  // 需在 app.config.ts 中开启 provideRouter(routes, withComponentInputBinding())
  id = input.required<string>(); 

  // 当前图书的信号，初始为 null
  book = signal<Book | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.loadBookDetails();
  }

  async loadBookDetails() {
    this.loading.set(true);
    this.bookService.fetchBookById(Number(this.id())).subscribe({
      next: (data) => {
        this.book.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
