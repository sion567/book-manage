package com.example.demo.web;


import com.example.demo.domain.Book;
import com.example.demo.domain.Category;
import com.example.demo.dto.BookRequest;
import com.example.demo.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@Tag(name = "Books")
@Slf4j
public class BookController {

    private final BookService service;

    @Operation(
            description = "save",
            summary = "Save Books",
            responses = {
                    @ApiResponse(
                            description = "Success",
                            responseCode = "200"
                    ),
                    @ApiResponse(
                            description = "Unauthorized / Invalid Token",
                            responseCode = "403"
                    )
            }

    )
    @PostMapping
    public ResponseEntity<?> save(@Valid @RequestBody BookRequest request) {
        Integer id = service.save(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(location).build();
    }

    @Operation(
            description = "分页获取图书列表",
            summary = "Get All Books with Pagination",
            responses = {
                    @ApiResponse(
                            description = "Success",
                            responseCode = "200"
                    ),
                    @ApiResponse(
                            description = "Unauthorized / Invalid Token",
                            responseCode = "403"
                    )
            }

    )
    @GetMapping
    public ResponseEntity<Page<Book>> find(@PageableDefault(
            size = 10,
            page = 0,
            sort = "id",
            direction = Sort.Direction.DESC
    ) Pageable pageable) {
        log.debug("[Books] find");
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/{book-id}")
    public ResponseEntity<Book> findById(@PathVariable("book-id") Integer bookId) {
        return ResponseEntity.ok(service.findById(bookId));
    }

    @Operation(
            description = "update",
            summary = "Update Books",
            responses = {
                    @ApiResponse(
                            description = "Success",
                            responseCode = "200"
                    ),
                    @ApiResponse(
                            description = "Unauthorized / Invalid Token",
                            responseCode = "403"
                    )
            }

    )

    @PutMapping("/{book-id}")
    public ResponseEntity<Void> update(@PathVariable("book-id") Integer bookId, @Valid @RequestBody BookRequest request) {
        if (request.getId() != null && !bookId.equals(request.getId())) {
            throw new IllegalArgumentException("路径 ID 与请求体 ID 不一致");
        }
        service.update(bookId, request);
        // 返回 202 Accepted 或 204 No Content
//        return ResponseEntity.accepted().build(); //语义灵活。请求已经接受，正在处理。前端检查 res.ok 即可
        return ResponseEntity.noContent().build(); // 传统规范，不可调用 res.json()
    }

    @Operation(
            description = "delete",
            summary = "Delete Books",
            responses = {
                    @ApiResponse(
                            description = "Success",
                            responseCode = "200"
                    ),
                    @ApiResponse(
                            description = "Unauthorized / Invalid Token",
                            responseCode = "403"
                    )
            }

    )
    @DeleteMapping("/{book-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("book-id") Integer bookId) {
        service.delete(bookId);
    }

    public List<Book> searchByTitleOrAuthor(String query) {
        return service.searchByTitleOrAuthor(query);
    }


    @GetMapping("/categories")
    public ResponseEntity<List<Category>> findCategories() {
        log.debug("[Books] categories");
        return ResponseEntity.ok(service.findAllCategory());
    }
}