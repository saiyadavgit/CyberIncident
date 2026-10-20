package com.cyberincident.backend.controller;

import com.cyberincident.backend.dto.AiIncidentAnalysisResponse;
import com.cyberincident.backend.dto.AiInvestigationSummaryResponse;
import com.cyberincident.backend.dto.AiRemediationPlanResponse;
import com.cyberincident.backend.dto.AiRequest;
import com.cyberincident.backend.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze-incident")
    public ResponseEntity<AiIncidentAnalysisResponse> analyzeIncident(
            @Valid @RequestBody AiRequest request) {

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        AiIncidentAnalysisResponse response = aiService.analyzeIncident(
                request.getIncidentId(),
                userEmail
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/remediation-plan")
    public ResponseEntity<AiRemediationPlanResponse> generateRemediationPlan(
            @Valid @RequestBody AiRequest request) {

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        AiRemediationPlanResponse response = aiService.generateRemediationPlan(
                request.getIncidentId(),
                userEmail
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/summarize-investigation")
    public ResponseEntity<AiInvestigationSummaryResponse> summarizeInvestigation(
            @Valid @RequestBody AiRequest request) {

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        AiInvestigationSummaryResponse response = aiService.summarizeInvestigation(
                request.getIncidentId(),
                userEmail
        );

        return ResponseEntity.ok(response);
    }
}
