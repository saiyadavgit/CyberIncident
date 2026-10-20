package com.cyberincident.backend.service;

import com.cyberincident.backend.dto.LoginRequest;
import com.cyberincident.backend.dto.LoginResponse;
import com.cyberincident.backend.dto.RegisterRequest;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.enums.Role;
import com.cyberincident.backend.repository.UserRepository;
import com.cyberincident.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.EMPLOYEE);

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        // Check whether account is currently locked
        if (user.getLockedUntil() != null) {

            if (LocalDateTime.now().isBefore(user.getLockedUntil())) {

                auditLogService.logAction(
                        user.getEmail(),
                        "LOGIN_BLOCKED_ACCOUNT_LOCKED",
                        null,
                        null
                );

                throw new RuntimeException(
                        "Account is temporarily locked. Please try again later."
                );
            }

            // Lock period has expired
            user.setLockedUntil(null);
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            int failedAttempts = user.getFailedLoginAttempts() + 1;

            user.setFailedLoginAttempts(failedAttempts);

            // Lock account after maximum failed attempts
            if (failedAttempts >= MAX_FAILED_ATTEMPTS) {

                user.setLockedUntil(
                        LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES)
                );

                userRepository.save(user);

                auditLogService.logAction(
                        user.getEmail(),
                        "ACCOUNT_LOCKED",
                        null,
                        null
                );

                throw new RuntimeException(
                        "Account is temporarily locked due to multiple failed login attempts."
                );
            }

            userRepository.save(user);

            auditLogService.logAction(
                    user.getEmail(),
                    "LOGIN_FAILED",
                    null,
                    null
            );

            throw new RuntimeException("Invalid email or password");
        }

        // Successful login resets failed attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        auditLogService.logAction(
                user.getEmail(),
                "LOGIN_SUCCESS",
                null,
                null
        );

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }
}