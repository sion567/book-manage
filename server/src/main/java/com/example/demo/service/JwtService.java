package com.example.demo.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key:long1234long1234long1234long1234}")
    private String secretKey;
    @Value("${application.security.jwt.expiration:86400000}")
    private long jwtExpiration;
    @Value("${application.security.jwt.refresh-token.expiration:604800000}")
    private long refreshExpiration;
    @Value("${application.security.jwt.issuer}")
    private String issuer;
    @Value("${application.security.jwt.audience}")
    private String audience;

    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, new HashMap<>());
    }

    public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        return buildToken(userDetails, extraClaims, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(userDetails, new HashMap<>(), refreshExpiration);
    }

    private String buildToken(UserDetails userDetails, Map<String, Object> extraClaims, long expire) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(expire);
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuer(issuer + "-refresh")
                .audience().add(audience).and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(getSecretKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        try {
            JwtParser parser = Jwts.parser().verifyWith(getSecretKey()).build();
            return parser.parseSignedClaims(token).getPayload();
        } catch (SignatureException | MalformedJwtException | IllegalArgumentException e) {
            // 签名错误或格式错误，统一视为非法令牌
            throw new BadCredentialsException("令牌无效或已被篡改");
        } catch (JwtException e) {
            // 3. 其他所有 JWT 相关异常
            throw new BadCredentialsException("JWT 解析失败");
        }
    }

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
}
