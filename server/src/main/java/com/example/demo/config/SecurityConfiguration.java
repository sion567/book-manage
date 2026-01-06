package com.example.demo.config;

import com.example.demo.web.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.security.autoconfigure.web.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;


import static com.example.demo.domain.Permission.*;
import static com.example.demo.domain.Role.*;
import static com.example.demo.utils.SecurityUtils.auths;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {

    private static final String[] WHITE_LIST_URL = {"/api/v1/auth/**",
            "/v2/api-docs",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/swagger-resources",
            "/swagger-resources/**",
            "/configuration/ui",
            "/configuration/security",
            "/swagger-ui/**",
            "/webjars/**",
            "/swagger-ui.html"};
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final LogoutHandler logoutHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers(PathRequest.toH2Console()).permitAll()
                                .requestMatchers(WHITE_LIST_URL).permitAll()
                                .requestMatchers(GET, "/api/v1/books/**").hasAnyAuthority(auths(ADMIN_READ, MANAGER_READ, USER_READ))
                                .requestMatchers(POST, "/api/v1/books/**").hasAnyAuthority(auths(ADMIN_CREATE, MANAGER_CREATE))
                                .requestMatchers(PUT, "/api/v1/books/**").hasAnyAuthority(auths(ADMIN_UPDATE, MANAGER_UPDATE))
                                .requestMatchers(DELETE, "/api/v1/books/**").hasAnyAuthority(auths(ADMIN_DELETE, MANAGER_DELETE))
                                .requestMatchers(DELETE, "/api/v1/users/**").hasAnyAuthority(auths(ADMIN_DELETE))
                                .requestMatchers("/api/v1/books/**").hasAnyRole(ADMIN.name(), MANAGER.name(), USER.name()) // 最后写通用的路径拦截 (Role 校验作为保底)
                                .anyRequest()
                                .authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(logout ->
                        logout.logoutUrl("/api/v1/auth/logout")
                                .addLogoutHandler(logoutHandler)
                                .logoutSuccessHandler((request, response, authentication) -> SecurityContextHolder.clearContext())
                )
        ;

        return http.build();
    }
}
