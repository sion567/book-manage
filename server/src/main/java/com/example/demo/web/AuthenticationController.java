package com.example.demo.web;

import com.example.demo.dto.AuthenticationRequest;
import com.example.demo.dto.AuthenticationResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    @Value("${application.security.jwt.refresh-token.expiration:604800000}")
    private long refreshExpiration;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/refresh-token")
    public void refreshToken(@RequestHeader("Authorization") String authHeader, HttpServletResponse response) throws IOException {
        service.refreshToken(authHeader, response);
    }

    @PostMapping("/authenticatev2")
    public ResponseEntity<?> authenticateV2(@Valid @RequestBody AuthenticationRequest request, HttpServletResponse response) {
        AuthenticationResponse res = service.authenticate(request);
        // 将 Refresh Token 存入 HttpOnly Cookie (安全关键)
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", res.getRefreshToken())
                .httpOnly(true)
                .secure(true) // 生产环境必须
                .path("/")
                .maxAge(refreshExpiration)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return ResponseEntity.ok(Map.of("access_token", res.getAccessToken()));
    }

    @PostMapping("/refresh-token-v2")
    public void refreshTokenV2(@CookieValue("refresh_token") String refreshToken, HttpServletResponse response) throws IOException {
        service.refreshToken(refreshToken, response);
    }
}
