package com.example.demo.web;

import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PatchMapping
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal connectedUser) {

        service.changePassword(request, connectedUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(service.findByEmail(authentication.getName()));
    }

}
