package com.example.demo.service;

import com.example.demo.domain.Book;
import com.example.demo.domain.Category;
import com.example.demo.dto.BookRequest;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository repository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public void save(BookRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId()).get();
        var book = Book.builder()
                .id(request.getId())
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .price(request.getPrice())
                .publicationDate(request.getPublicationDate())
                .category(category)
                .build();
        repository.save(book);
    }

    public List<Book> findAll() {
        return repository.findAll();
    }

    public Book findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("图书未找到 ID: " + id));
    }

    @Transactional
    public void update(Integer id, BookRequest request) {
        Book existingBook = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("图书未找到 ID: " + id));

        if (!existingBook.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("新分類未找到: " + request.getCategoryId()));
            existingBook.setCategory(category);
        }

        existingBook.setTitle(request.getTitle());
        existingBook.setAuthor(request.getAuthor());
        existingBook.setIsbn(request.getIsbn());
        existingBook.setPrice(request.getPrice());
        existingBook.setPublicationDate(request.getPublicationDate());

        repository.save(existingBook);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("圖書未找到 ID: " + id);
        }
        repository.deleteById(id);
    }

    public List<Book> searchByTitleOrAuthor(String query) {
        return repository.findAllByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query);
    }

    public List<Category> findAllCategory() {
        return categoryRepository.findAll();
    }
}
