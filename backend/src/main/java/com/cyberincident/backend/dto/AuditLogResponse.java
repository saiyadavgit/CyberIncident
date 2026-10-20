package com.cyberincident.backend.dto;

import java.time.LocalDateTime;

public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private Long incidentId;
    private String incidentTitle;
    private String ipAddress;
    private LocalDateTime timestamp;

    public AuditLogResponse(
            Long id,
            Long userId,
            String userName,
            String action,
            Long incidentId,
            String incidentTitle,
            String ipAddress,
            LocalDateTime timestamp) {

        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.incidentId = incidentId;
        this.incidentTitle = incidentTitle;
        this.ipAddress = ipAddress;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getAction() {
        return action;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public String getIncidentTitle() {
        return incidentTitle;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}