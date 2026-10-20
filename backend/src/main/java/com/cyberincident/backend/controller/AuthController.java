package com.cyberincident.backend.controller;

import com.cyberincident.backend.dto.LoginRequest;
import com.cyberincident.backend.dto.LoginResponse;
import com.cyberincident.backend.dto.RegisterRequest;
import com.cyberincident.backend.dto.RegisterResponse;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.exception.RateLimitExceededException;
import com.cyberincident.backend.service.AuthService;
import com.cyberincident.backend.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    public AuthController(
            AuthService authService,
            RateLimitService rateLimitService) {

        this.authService = authService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        RegisterResponse response = new RegisterResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = getClientIp(httpRequest);

        if (!rateLimitService.isAllowed("login:" + clientIp)) {

            throw new RateLimitExceededException(
                    "Too many login attempts. Please try again later."
            );
        }

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    private String getClientIp(HttpServletRequest request) {

        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}