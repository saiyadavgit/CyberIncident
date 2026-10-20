package com.cyberincident.backend.controller;

import com.cyberincident.backend.dto.CreateIncidentRequest;
import com.cyberincident.backend.dto.IncidentResponse;
import com.cyberincident.backend.dto.InvestigationResponse;
import com.cyberincident.backend.service.IncidentService;
import com.cyberincident.backend.service.InvestigationService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;
    private final InvestigationService investigationService;

    public IncidentController(
            IncidentService incidentService,
            InvestigationService investigationService) {

        this.incidentService = incidentService;
        this.investigationService = investigationService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
            @Valid @RequestBody CreateIncidentRequest request) {

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        IncidentResponse response =
                incidentService.createIncident(request, userEmail);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<IncidentResponse>> getMyIncidents() {

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        List<IncidentResponse> incidents =
                incidentService.getMyIncidents(userEmail);

        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{incidentId}")
    public ResponseEntity<IncidentResponse> getIncidentById(
            @PathVariable Long incidentId) {

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        IncidentResponse response =
                incidentService.getIncidentById(
                        incidentId,
                        userEmail
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{incidentId}/investigation")
    public ResponseEntity<InvestigationResponse> getInvestigation(
            @PathVariable Long incidentId) {

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        InvestigationResponse response =
                investigationService.getInvestigationByIncidentId(
                        incidentId,
                        userEmail
                );

        return ResponseEntity.ok(response);
    }
}