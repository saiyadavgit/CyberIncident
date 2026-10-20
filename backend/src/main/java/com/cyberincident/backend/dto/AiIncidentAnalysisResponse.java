package com.cyberincident.backend.dto;

import java.util.List;

public class AiIncidentAnalysisResponse {

    private Long incidentId;
    private String threatSummary;
    private String suggestedSeverity;
    private String attackCategory;
    private List<String> riskFactors;
    private List<String> investigationSuggestions;
    private String disclaimer;

    public AiIncidentAnalysisResponse() {
        this.disclaimer = "AI-generated recommendation only. Does not automatically alter official incident records or severity.";
    }

    public AiIncidentAnalysisResponse(
            Long incidentId,
            String threatSummary,
            String suggestedSeverity,
            String attackCategory,
            List<String> riskFactors,
            List<String> investigationSuggestions) {

        this.incidentId = incidentId;
        this.threatSummary = threatSummary;
        this.suggestedSeverity = suggestedSeverity;
        this.attackCategory = attackCategory;
        this.riskFactors = riskFactors;
        this.investigationSuggestions = investigationSuggestions;
        this.disclaimer = "AI-generated recommendation only. Does not automatically alter official incident records or severity.";
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public String getThreatSummary() {
        return threatSummary;
    }

    public void setThreatSummary(String threatSummary) {
        this.threatSummary = threatSummary;
    }

    public String getSuggestedSeverity() {
        return suggestedSeverity;
    }

    public void setSuggestedSeverity(String suggestedSeverity) {
        this.suggestedSeverity = suggestedSeverity;
    }

    public String getAttackCategory() {
        return attackCategory;
    }

    public void setAttackCategory(String attackCategory) {
        this.attackCategory = attackCategory;
    }

    public List<String> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public List<String> getInvestigationSuggestions() {
        return investigationSuggestions;
    }

    public void setInvestigationSuggestions(List<String> investigationSuggestions) {
        this.investigationSuggestions = investigationSuggestions;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
