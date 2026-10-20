package com.cyberincident.backend.service;

import com.cyberincident.backend.dto.AiIncidentAnalysisResponse;
import com.cyberincident.backend.dto.AiInvestigationSummaryResponse;
import com.cyberincident.backend.dto.AiRemediationPlanResponse;
import com.cyberincident.backend.entity.Evidence;
import com.cyberincident.backend.entity.Incident;
import com.cyberincident.backend.entity.Investigation;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.enums.Role;
import com.cyberincident.backend.exception.AccessDeniedException;
import com.cyberincident.backend.exception.ResourceNotFoundException;
import com.cyberincident.backend.repository.EvidenceRepository;
import com.cyberincident.backend.repository.IncidentRepository;
import com.cyberincident.backend.repository.InvestigationRepository;
import com.cyberincident.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final IncidentRepository incidentRepository;
    private final InvestigationRepository investigationRepository;
    private final EvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final GroqClientService groqClientService;
    private final ObjectMapper objectMapper;

    public AiService(
            IncidentRepository incidentRepository,
            InvestigationRepository investigationRepository,
            EvidenceRepository evidenceRepository,
            UserRepository userRepository,
            GroqClientService groqClientService,
            ObjectMapper objectMapper) {

        this.incidentRepository = incidentRepository;
        this.investigationRepository = investigationRepository;
        this.evidenceRepository = evidenceRepository;
        this.userRepository = userRepository;
        this.groqClientService = groqClientService;
        this.objectMapper = objectMapper;
    }

    public AiIncidentAnalysisResponse analyzeIncident(Long incidentId, String userEmail) {
        Incident incident = validateAccessAndGetIncident(incidentId, userEmail);
        Optional<Investigation> investigationOpt = investigationRepository.findByIncidentId(incidentId);
        List<Evidence> evidenceList = evidenceRepository.findByIncidentId(incidentId);

        String contextPrompt = buildIncidentContext(incident, investigationOpt.orElse(null), evidenceList);

        String systemPrompt = """
            You are an expert Senior Cybersecurity Incident Response Analyst.
            Analyze the provided incident details and return a structured analysis as a JSON object with EXACTLY the following keys:
            - "threatSummary": String summarizing the security threat
            - "suggestedSeverity": String ("LOW", "MEDIUM", "HIGH", or "CRITICAL")
            - "attackCategory": String (e.g., "Phishing", "Malware Outbreak", "Unauthorized Access", etc.)
            - "riskFactors": Array of Strings detailing key risk indicators
            - "investigationSuggestions": Array of Strings detailing recommended next steps for analysts

            Do not include markdown code block backticks. Output valid JSON only.
            """;

        if (!groqClientService.isConfigured()) {
            return generateFallbackIncidentAnalysis(incident);
        }

        try {
            String jsonOutput = groqClientService.callGroqApi(systemPrompt, contextPrompt);
            JsonNode root = objectMapper.readTree(cleanJsonResponse(jsonOutput));

            AiIncidentAnalysisResponse response = new AiIncidentAnalysisResponse();
            response.setIncidentId(incident.getId());
            response.setThreatSummary(root.path("threatSummary").asText("Potential security threat requiring investigation."));
            response.setSuggestedSeverity(root.path("suggestedSeverity").asText(incident.getSeverity().name()));
            response.setAttackCategory(root.path("attackCategory").asText(incident.getType().name()));
            response.setRiskFactors(parseStringList(root.path("riskFactors")));
            response.setInvestigationSuggestions(parseStringList(root.path("investigationSuggestions")));
            return response;

        } catch (Exception e) {
            logger.warn("Falling back to local heuristic response due to AI service exception: {}", e.getMessage());
            return generateFallbackIncidentAnalysis(incident);
        }
    }

    public AiRemediationPlanResponse generateRemediationPlan(Long incidentId, String userEmail) {
        Incident incident = validateAccessAndGetIncident(incidentId, userEmail);
        Optional<Investigation> investigationOpt = investigationRepository.findByIncidentId(incidentId);
        List<Evidence> evidenceList = evidenceRepository.findByIncidentId(incidentId);

        String contextPrompt = buildIncidentContext(incident, investigationOpt.orElse(null), evidenceList);

        String systemPrompt = """
            You are a Cybersecurity Incident Remediation Specialist.
            Based on the incident context provided, generate a detailed step-by-step remediation plan.
            Return a JSON object with EXACTLY these keys:
            - "immediateActions": Array of Strings
            - "containmentActions": Array of Strings
            - "investigationActions": Array of Strings
            - "recoveryActions": Array of Strings
            - "monitoringRecommendations": Array of Strings

            Do not include markdown code block backticks. Output valid JSON only.
            """;

        if (!groqClientService.isConfigured()) {
            return generateFallbackRemediationPlan(incident);
        }

        try {
            String jsonOutput = groqClientService.callGroqApi(systemPrompt, contextPrompt);
            JsonNode root = objectMapper.readTree(cleanJsonResponse(jsonOutput));

            AiRemediationPlanResponse response = new AiRemediationPlanResponse();
            response.setIncidentId(incident.getId());
            response.setImmediateActions(parseStringList(root.path("immediateActions")));
            response.setContainmentActions(parseStringList(root.path("containmentActions")));
            response.setInvestigationActions(parseStringList(root.path("investigationActions")));
            response.setRecoveryActions(parseStringList(root.path("recoveryActions")));
            response.setMonitoringRecommendations(parseStringList(root.path("monitoringRecommendations")));
            return response;

        } catch (Exception e) {
            logger.warn("Falling back to local heuristic response due to AI service exception: {}", e.getMessage());
            return generateFallbackRemediationPlan(incident);
        }
    }

    public AiInvestigationSummaryResponse summarizeInvestigation(Long incidentId, String userEmail) {
        Incident incident = validateAccessAndGetIncident(incidentId, userEmail);
        Optional<Investigation> investigationOpt = investigationRepository.findByIncidentId(incidentId);
        List<Evidence> evidenceList = evidenceRepository.findByIncidentId(incidentId);

        String contextPrompt = buildIncidentContext(incident, investigationOpt.orElse(null), evidenceList);

        String systemPrompt = """
            You are a Lead Incident Commander summarizing a cyber incident for executive leadership.
            Return a JSON object with EXACTLY these keys:
            - "executiveSummary": String high-level summary for leadership
            - "whatHappened": String narrative of what occurred
            - "impact": String assessment of organizational impact
            - "actionsTaken": String summary of actions performed by security team
            - "currentStatus": String operational status summary
            - "recommendedNextSteps": Array of Strings strategic recommendations

            Do not include markdown code block backticks. Output valid JSON only.
            """;

        if (!groqClientService.isConfigured()) {
            return generateFallbackInvestigationSummary(incident, investigationOpt.orElse(null));
        }

        try {
            String jsonOutput = groqClientService.callGroqApi(systemPrompt, contextPrompt);
            JsonNode root = objectMapper.readTree(cleanJsonResponse(jsonOutput));

            AiInvestigationSummaryResponse response = new AiInvestigationSummaryResponse();
            response.setIncidentId(incident.getId());
            response.setExecutiveSummary(root.path("executiveSummary").asText("Executive summary generated for incident #" + incident.getId()));
            response.setWhatHappened(root.path("whatHappened").asText(incident.getDescription()));
            response.setImpact(root.path("impact").asText("Impact assessed based on incident type: " + incident.getType()));
            response.setActionsTaken(root.path("actionsTaken").asText(investigationOpt.map(Investigation::getActionsTaken).orElse("Initial triage conducted.")));
            response.setCurrentStatus(root.path("currentStatus").asText("Current incident state: " + incident.getStatus()));
            response.setRecommendedNextSteps(parseStringList(root.path("recommendedNextSteps")));
            return response;

        } catch (Exception e) {
            logger.warn("Falling back to local heuristic response due to AI service exception: {}", e.getMessage());
            return generateFallbackInvestigationSummary(incident, investigationOpt.orElse(null));
        }
    }

    private Incident validateAccessAndGetIncident(Long incidentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with ID: " + incidentId));

        if (user.getRole() == Role.EMPLOYEE) {
            if (!incident.getReportedBy().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You are not authorized to view or analyze this incident.");
            }
        }

        return incident;
    }

    private String buildIncidentContext(Incident incident, Investigation investigation, List<Evidence> evidenceList) {
        StringBuilder sb = new StringBuilder();
        sb.append("INCIDENT DETAILS:\n");
        sb.append("ID: ").append(incident.getId()).append("\n");
        sb.append("Title: ").append(incident.getTitle()).append("\n");
        sb.append("Description: ").append(incident.getDescription()).append("\n");
        sb.append("Type: ").append(incident.getType()).append("\n");
        sb.append("Severity: ").append(incident.getSeverity()).append("\n");
        sb.append("Status: ").append(incident.getStatus()).append("\n");
        sb.append("Reported Date: ").append(incident.getCreatedAt()).append("\n\n");

        if (investigation != null) {
            sb.append("INVESTIGATION FINDINGS:\n");
            sb.append("Findings: ").append(investigation.getFindings()).append("\n");
            sb.append("Actions Taken: ").append(investigation.getActionsTaken()).append("\n\n");
        }

        if (evidenceList != null && !evidenceList.isEmpty()) {
            sb.append("ATTACHED EVIDENCE FILES (").append(evidenceList.size()).append("):\n");
            for (Evidence ev : evidenceList) {
                sb.append("- File: ").append(ev.getOriginalFileName())
                        .append(" (Type: ").append(ev.getContentType())
                        .append(", Size: ").append(ev.getFileSize()).append(" bytes)\n");
            }
        }

        return sb.toString();
    }

    private String cleanJsonResponse(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    private List<String> parseStringList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual()) {
                    result.add(item.asText());
                }
            }
        }
        return result;
    }

    private AiIncidentAnalysisResponse generateFallbackIncidentAnalysis(Incident incident) {
        AiIncidentAnalysisResponse response = new AiIncidentAnalysisResponse();
        response.setIncidentId(incident.getId());
        response.setThreatSummary("Heuristic Security Summary: " + incident.getTitle() + " classified under type " + incident.getType());
        response.setSuggestedSeverity(incident.getSeverity().name());
        response.setAttackCategory(incident.getType().name());
        response.setRiskFactors(List.of(
                "Potential security impact related to " + incident.getType(),
                "Incident status currently set to " + incident.getStatus()
        ));
        response.setInvestigationSuggestions(List.of(
                "Verify system logs and user authentication activity.",
                "Collect relevant network artifact evidence.",
                "Review associated endpoint process trees."
        ));
        return response;
    }

    private AiRemediationPlanResponse generateFallbackRemediationPlan(Incident incident) {
        AiRemediationPlanResponse response = new AiRemediationPlanResponse();
        response.setIncidentId(incident.getId());
        response.setImmediateActions(List.of("Isolate affected target system from external network.", "Reset credential credentials if compromise is suspected."));
        response.setContainmentActions(List.of("Block associated indicators of compromise (IP/Domains).", "Revoke compromised session tokens."));
        response.setInvestigationActions(List.of("Export security audit logs for timeline reconstruction.", "Analyze uploaded evidence files."));
        response.setRecoveryActions(List.of("Restore impacted systems from trusted backups.", "Apply system patches and configuration updates."));
        response.setMonitoringRecommendations(List.of("Enable enhanced log monitoring for 72 hours.", "Configure automated alerts for anomalous activity."));
        return response;
    }

    private AiInvestigationSummaryResponse generateFallbackInvestigationSummary(Incident incident, Investigation investigation) {
        AiInvestigationSummaryResponse response = new AiInvestigationSummaryResponse();
        response.setIncidentId(incident.getId());
        response.setExecutiveSummary("Incident #" + incident.getId() + " (" + incident.getTitle() + ") is currently in status " + incident.getStatus() + ".");
        response.setWhatHappened(incident.getDescription());
        response.setImpact("Assessed as " + incident.getSeverity() + " severity incident involving " + incident.getType() + ".");
        response.setActionsTaken(investigation != null ? investigation.getActionsTaken() : "Initial security triage logged.");
        response.setCurrentStatus(incident.getStatus().name());
        response.setRecommendedNextSteps(List.of(
                "Complete full investigation findings log.",
                "Conduct post-incident review upon closure."
        ));
        return response;
    }
}
