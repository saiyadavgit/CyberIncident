package com.cyberincident.backend.service;

import com.cyberincident.backend.dto.UserResponse;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.enums.Role;
import com.cyberincident.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AdminService(
            UserRepository userRepository,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public UserResponse updateUserRole(
            Long userId,
            Role newRole,
            String adminEmail) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        if (admin.getId().equals(userId)) {
            throw new RuntimeException(
                    "Admin cannot change their own role"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Role oldRole = user.getRole();

        user.setRole(newRole);

        User updatedUser = userRepository.save(user);

        auditLogService.logAction(
                adminEmail,
                "USER_ROLE_UPDATED_FROM_" + oldRole + "_TO_" + newRole,
                null,
                null
        );

        return mapToResponse(updatedUser);
    }

    private UserResponse mapToResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}