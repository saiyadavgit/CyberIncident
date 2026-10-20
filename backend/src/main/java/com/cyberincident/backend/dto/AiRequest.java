package com.cyberincident.backend.dto;

import jakarta.validation.constraints.NotNull;

public class AiRequest {

    @NotNull(message = "Incident ID is required")
    private Long incidentId;

    public AiRequest() {
    }

    public AiRequest(Long incidentId) {
        this.incidentId = incidentId;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }
}
