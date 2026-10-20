package com.cyberincident.backend.service;

import com.cyberincident.backend.dto.AuditLogResponse;
import com.cyberincident.backend.entity.AuditLog;
import com.cyberincident.backend.entity.Incident;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.repository.AuditLogRepository;
import com.cyberincident.backend.repository.IncidentRepository;
import com.cyberincident.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository,
            IncidentRepository incidentRepository) {

        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
    }

    public void logAction(
            String userEmail,
            String action,
            Long incidentId,
            String ipAddress) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        AuditLog auditLog = new AuditLog();

        auditLog.setUser(user);
        auditLog.setAction(action);

        // Automatically capture IP when caller does not provide one
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = getClientIpAddress();
        }

        auditLog.setIpAddress(ipAddress);

        if (incidentId != null) {

            Incident incident = incidentRepository.findById(incidentId)
                    .orElseThrow(() ->
                            new RuntimeException("Incident not found"));

            auditLog.setIncident(incident);
        }

        auditLogRepository.save(auditLog);
    }

    private String getClientIpAddress() {

        ServletRequestAttributes attributes =
                (ServletRequestAttributes)
                        RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            return null;
        }

        HttpServletRequest request = attributes.getRequest();

        return request.getRemoteAddr();
    }

    public List<AuditLogResponse> getAllLogs() {

        return auditLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<AuditLogResponse> getLogsByIncident(
            Long incidentId) {

        return auditLogRepository.findByIncidentId(incidentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditLogResponse mapToResponse(AuditLog log) {

        Long incidentId = null;
        String incidentTitle = null;

        if (log.getIncident() != null) {
            incidentId = log.getIncident().getId();
            incidentTitle = log.getIncident().getTitle();
        }

        return new AuditLogResponse(
                log.getId(),
                log.getUser().getId(),
                log.getUser().getName(),
                log.getAction(),
                incidentId,
                incidentTitle,
                log.getIpAddress(),
                log.getTimestamp()
        );
    }
}