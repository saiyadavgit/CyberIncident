package com.cyberincident.backend.dto;

import com.cyberincident.backend.enums.IncidentSeverity;
import com.cyberincident.backend.enums.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateIncidentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Incident type is required")
    private IncidentType type;

    @NotNull(message = "Incident severity is required")
    private IncidentSeverity severity;

    public CreateIncidentRequest() {
    }

    public CreateIncidentRequest(String title, String description, IncidentType type, IncidentSeverity severity) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IncidentType getType() {
        return type;
    }

    public void setType(IncidentType type) {
        this.type = type;
    }

    public IncidentSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(IncidentSeverity severity) {
        this.severity = severity;
    }
}
