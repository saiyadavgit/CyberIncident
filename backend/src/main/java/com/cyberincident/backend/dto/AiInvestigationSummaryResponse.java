package com.cyberincident.backend.dto;

import java.util.List;

public class AiInvestigationSummaryResponse {

    private Long incidentId;
    private String executiveSummary;
    private String whatHappened;
    private String impact;
    private String actionsTaken;
    private String currentStatus;
    private List<String> recommendedNextSteps;
    private String disclaimer;

    public AiInvestigationSummaryResponse() {
        this.disclaimer = "AI-generated investigation summary recommendation only.";
    }

    public AiInvestigationSummaryResponse(
            Long incidentId,
            String executiveSummary,
            String whatHappened,
            String impact,
            String actionsTaken,
            String currentStatus,
            List<String> recommendedNextSteps) {

        this.incidentId = incidentId;
        this.executiveSummary = executiveSummary;
        this.whatHappened = whatHappened;
        this.impact = impact;
        this.actionsTaken = actionsTaken;
        this.currentStatus = currentStatus;
        this.recommendedNextSteps = recommendedNextSteps;
        this.disclaimer = "AI-generated investigation summary recommendation only.";
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public String getWhatHappened() {
        return whatHappened;
    }

    public void setWhatHappened(String whatHappened) {
        this.whatHappened = whatHappened;
    }

    public String getImpact() {
        return impact;
    }

    public void setImpact(String impact) {
        this.impact = impact;
    }

    public String getActionsTaken() {
        return actionsTaken;
    }

    public void setActionsTaken(String actionsTaken) {
        this.actionsTaken = actionsTaken;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public List<String> getRecommendedNextSteps() {
        return recommendedNextSteps;
    }

    public void setRecommendedNextSteps(List<String> recommendedNextSteps) {
        this.recommendedNextSteps = recommendedNextSteps;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
