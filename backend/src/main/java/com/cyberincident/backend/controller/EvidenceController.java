package com.cyberincident.backend.controller;

import com.cyberincident.backend.dto.EvidenceResponse;
import com.cyberincident.backend.service.EvidenceService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @PostMapping(
            value = "/{incidentId}/evidence",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<EvidenceResponse> uploadEvidence(
            @PathVariable Long incidentId,
            @RequestParam("file") MultipartFile file) {

        String userEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        EvidenceResponse response =
                evidenceService.uploadEvidence(
                        incidentId,
                        file,
                        userEmail
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{incidentId}/evidence")
    public ResponseEntity<List<EvidenceResponse>> getEvidence(
            @PathVariable Long incidentId) {

        String userEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return ResponseEntity.ok(
                evidenceService.getEvidenceForIncident(
                        incidentId,
                        userEmail
                )
        );
    }

    @GetMapping("/{incidentId}/evidence/{evidenceId}/download")
    public ResponseEntity<Resource> downloadEvidence(
            @PathVariable Long incidentId,
            @PathVariable Long evidenceId) {

        String userEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Resource resource =
                evidenceService.downloadEvidence(
                        incidentId,
                        evidenceId,
                        userEmail
                );

        return ResponseEntity.ok()
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                resource.getFilename() +
                                "\""
                )
                .body(resource);
    }
}