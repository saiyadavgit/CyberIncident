package com.cyberincident.backend.controller;

import com.cyberincident.backend.service.AnalyticsService;
import com.cyberincident.backend.service.AuditAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AuditAnalyticsService auditAnalyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService,
            AuditAnalyticsService auditAnalyticsService) {

        this.analyticsService = analyticsService;
        this.auditAnalyticsService = auditAnalyticsService;
    }

    @GetMapping("/incidents")
    public ResponseEntity<Map<String, Object>> getIncidentAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getIncidentAnalytics()
        );
    }

    @GetMapping("/audit")
    public ResponseEntity<Map<String, Object>> getAuditAnalytics() {

        return ResponseEntity.ok(
                auditAnalyticsService.getAuditAnalytics()
        );
    }
}