import { Component, inject, input, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../data-access/book.service';
import { Book } from '../data-access/book.model';

@Component({
  selector: 'app-book-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './book-edit.html',
  styleUrl: './book-edit.scss',
})
export class BookEdit implements OnInit {
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  bookForm!: FormGroup;
  isEditMode = signal(false); // 使用 Signal 追蹤模式
  bookId: number | null = null;
  categories = signal<any[]>([]);

  ngOnInit() {
    this.initForm();
    this.loadCategories();

    // 檢查路由參數是否有 id
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('Detected ID Param:', idParam); 
    if (idParam && idParam !== 'add') {
      this.bookId = Number(idParam);
      this.isEditMode.set(true);
      this.loadBookData(this.bookId); // 只有修改模式才调这个方法
    } else {
      this.isEditMode.set(false); // 明确设置为添加模式
      console.log('当前是添加模式，无需加载图书数据');
    }
  }

  private initForm() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      isbn: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      categoryId: [null, [Validators.required]],
      publicationDate: [null, [Validators.required]],
    });
  }

  private loadCategories() {
    this.bookService.fetchCategories().subscribe((data) => this.categories.set(data));
  }

  private loadBookData(id: number) {
    this.bookService.fetchBookById(id).subscribe((book) => {
      // patchValue 会根据key自动填充表单
      this.bookForm.patchValue({
        ...book,
        categoryId: book.category?.id,
      });
    });
  }

  onSubmit() {
    if (this.bookForm.invalid) return;

    const bookData = this.bookForm.value;

    if (this.isEditMode()) {
      this.bookService.updateBook(this.bookId!, bookData).subscribe(() => this.goBack());
    } else {
      this.bookService.createBook(bookData).subscribe(() => this.goBack());
    }
  }

  goBack() {
    this.router.navigate(['/books']);
  }
}
