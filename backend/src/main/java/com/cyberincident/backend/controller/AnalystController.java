package com.cyberincident.backend.controller;

import com.cyberincident.backend.dto.CreateInvestigationRequest;
import com.cyberincident.backend.dto.IncidentResponse;
import com.cyberincident.backend.dto.InvestigationResponse;
import com.cyberincident.backend.enums.IncidentStatus;
import com.cyberincident.backend.service.IncidentService;
import com.cyberincident.backend.service.InvestigationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analyst")
public class AnalystController {

    private final IncidentService incidentService;
    private final InvestigationService investigationService;

    public AnalystController(
            IncidentService incidentService,
            InvestigationService investigationService) {

        this.incidentService = incidentService;
        this.investigationService = investigationService;
    }

    @GetMapping("/incidents")
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {

        return ResponseEntity.ok(
                incidentService.getAllIncidentsForAnalyst()
        );
    }

    @PostMapping("/incidents/{incidentId}/assign")
    public ResponseEntity<IncidentResponse> assignIncident(
            @PathVariable Long incidentId,
            @RequestParam Long assigneeId) {

        String analystEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        IncidentResponse response = incidentService.assignIncident(
                incidentId,
                analystEmail,
                assigneeId
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/incidents/{incidentId}/status")
    public ResponseEntity<IncidentResponse> updateIncidentStatus(
            @PathVariable Long incidentId,
            @RequestParam IncidentStatus status) {

        String analystEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        IncidentResponse response = incidentService.updateIncidentStatus(
                incidentId,
                analystEmail,
                status
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/incidents/{incidentId}/investigation")
    public ResponseEntity<InvestigationResponse> createInvestigation(
            @PathVariable Long incidentId,
            @Valid @RequestBody CreateInvestigationRequest request) {

        String analystEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        request.setIncidentId(incidentId);

        InvestigationResponse response =
                investigationService.createInvestigation(
                        request,
                        analystEmail
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/incidents/{incidentId}/investigation")
    public ResponseEntity<InvestigationResponse> updateInvestigation(
            @PathVariable Long incidentId,
            @Valid @RequestBody CreateInvestigationRequest request) {

        String analystEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        InvestigationResponse response =
                investigationService.updateInvestigation(
                        incidentId,
                        request,
                        analystEmail
                );

        return ResponseEntity.ok(response);
    }
}