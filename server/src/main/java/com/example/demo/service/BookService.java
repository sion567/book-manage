package com.example.demo.service;

import com.example.demo.domain.Book;
import com.example.demo.dto.BookRequest;
import com.example.demo.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository repository;

    public void save(BookRequest request) {
        var book = Book.builder()
                .id(request.getId())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .build();
        repository.save(book);
    }

    public List<Book> findAll() {
        return repository.findAll();
    }
}
