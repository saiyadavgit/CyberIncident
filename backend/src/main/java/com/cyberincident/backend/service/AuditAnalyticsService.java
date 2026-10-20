package com.cyberincident.backend.service;

import com.cyberincident.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuditAnalyticsService {

    private final AuditLogRepository auditLogRepository;

    public AuditAnalyticsService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public Map<String, Object> getAuditAnalytics() {

        Map<String, Object> analytics = new LinkedHashMap<>();

        Map<String, Long> securityEvents = new LinkedHashMap<>();

        securityEvents.put(
                "loginSuccess",
                auditLogRepository.countByAction("LOGIN_SUCCESS")
        );

        securityEvents.put(
                "loginFailed",
                auditLogRepository.countByAction("LOGIN_FAILED")
        );

        securityEvents.put(
                "accountLocked",
                auditLogRepository.countByAction("ACCOUNT_LOCKED")
        );

        securityEvents.put(
                "loginBlockedAccountLocked",
                auditLogRepository.countByAction(
                        "LOGIN_BLOCKED_ACCOUNT_LOCKED"
                )
        );

        securityEvents.put(
                "incidentsCreated",
                auditLogRepository.countByAction("INCIDENT_CREATED")
        );

        securityEvents.put(
                "incidentsAssigned",
                auditLogRepository.countByAction("INCIDENT_ASSIGNED")
        );

        securityEvents.put(
                "investigationsCreated",
                auditLogRepository.countByAction(
                        "INVESTIGATION_CREATED"
                )
        );

        securityEvents.put(
                "evidenceUploaded",
                auditLogRepository.countByAction(
                        "EVIDENCE_UPLOADED"
                )
        );

        analytics.put("securityEvents", securityEvents);

        analytics.put(
                "totalAuditLogs",
                auditLogRepository.count()
        );

        return analytics;
    }
}