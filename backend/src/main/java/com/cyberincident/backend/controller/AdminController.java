package com.cyberincident.backend.controller;

import com.cyberincident.backend.dto.UpdateUserRoleRequest;
import com.cyberincident.backend.dto.UserResponse;
import com.cyberincident.backend.dto.AuditLogResponse;
import com.cyberincident.backend.service.AdminService;
import com.cyberincident.backend.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    public AdminController(
            AdminService adminService,
            AuditLogService auditLogService) {

        this.adminService = adminService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                adminService.getAllUsers()
        );
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {

        String adminEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        UserResponse response = adminService.updateUserRole(
                userId,
                request.getRole(),
                adminEmail
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> getAllAuditLogs() {

        return ResponseEntity.ok(
                auditLogService.getAllLogs()
        );
    }
}