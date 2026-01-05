package com.example.demo.web;


import com.example.demo.domain.Book;
import com.example.demo.dto.BookRequest;
import com.example.demo.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@Tag(name = "Books")
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
        service.save(request);
        return ResponseEntity.accepted().build();
    }
    @Operation(
            description = "find",
            summary = "Get All Books",
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
    public ResponseEntity<List<Book>> find() {
        return ResponseEntity.ok(service.findAll());
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
    @PutMapping
    public String update() {
        return "PUT:: management controller";
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
    @DeleteMapping
    public String delete() {
        return "DELETE:: management controller";
    }
}