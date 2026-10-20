package com.cyberincident.backend.service;

import com.cyberincident.backend.enums.IncidentSeverity;
import com.cyberincident.backend.enums.IncidentStatus;
import com.cyberincident.backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    private final IncidentRepository incidentRepository;

    public AnalyticsService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public Map<String, Object> getIncidentAnalytics() {

        Map<String, Object> analytics = new LinkedHashMap<>();

        // Total incidents
        analytics.put(
                "totalIncidents",
                incidentRepository.count()
        );

        // Incidents by status
        Map<String, Long> byStatus = new LinkedHashMap<>();

        for (IncidentStatus status : IncidentStatus.values()) {
            byStatus.put(
                    status.name(),
                    incidentRepository.countByStatus(status)
            );
        }

        analytics.put("incidentsByStatus", byStatus);

        // Incidents by severity
        Map<String, Long> bySeverity = new LinkedHashMap<>();

        for (IncidentSeverity severity : IncidentSeverity.values()) {
            bySeverity.put(
                    severity.name(),
                    incidentRepository.countBySeverity(severity)
            );
        }

        analytics.put("incidentsBySeverity", bySeverity);

        return analytics;
    }
}