package com.cyberincident.backend.dto;

import java.time.LocalDateTime;

public class EvidenceResponse {

    private Long id;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private Long incidentId;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;

    public EvidenceResponse(
            Long id,
            String originalFileName,
            String contentType,
            Long fileSize,
            Long incidentId,
            Long uploadedById,
            String uploadedByName,
            LocalDateTime uploadedAt) {

        this.id = id;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.incidentId = incidentId;
        this.uploadedById = uploadedById;
        this.uploadedByName = uploadedByName;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}