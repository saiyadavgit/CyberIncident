package com.cyberincident.backend.dto;

import java.util.List;

public class AiRemediationPlanResponse {

    private Long incidentId;
    private List<String> immediateActions;
    private List<String> containmentActions;
    private List<String> investigationActions;
    private List<String> recoveryActions;
    private List<String> monitoringRecommendations;
    private String disclaimer;

    public AiRemediationPlanResponse() {
        this.disclaimer = "AI-generated response recommendations only. Does not automatically execute security operations.";
    }

    public AiRemediationPlanResponse(
            Long incidentId,
            List<String> immediateActions,
            List<String> containmentActions,
            List<String> investigationActions,
            List<String> recoveryActions,
            List<String> monitoringRecommendations) {

        this.incidentId = incidentId;
        this.immediateActions = immediateActions;
        this.containmentActions = containmentActions;
        this.investigationActions = investigationActions;
        this.recoveryActions = recoveryActions;
        this.monitoringRecommendations = monitoringRecommendations;
        this.disclaimer = "AI-generated response recommendations only. Does not automatically execute security operations.";
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public List<String> getImmediateActions() {
        return immediateActions;
    }

    public void setImmediateActions(List<String> immediateActions) {
        this.immediateActions = immediateActions;
    }

    public List<String> getContainmentActions() {
        return containmentActions;
    }

    public void setContainmentActions(List<String> containmentActions) {
        this.containmentActions = containmentActions;
    }

    public List<String> getInvestigationActions() {
        return investigationActions;
    }

    public void setInvestigationActions(List<String> investigationActions) {
        this.investigationActions = investigationActions;
    }

    public List<String> getRecoveryActions() {
        return recoveryActions;
    }

    public void setRecoveryActions(List<String> recoveryActions) {
        this.recoveryActions = recoveryActions;
    }

    public List<String> getMonitoringRecommendations() {
        return monitoringRecommendations;
    }

    public void setMonitoringRecommendations(List<String> monitoringRecommendations) {
        this.monitoringRecommendations = monitoringRecommendations;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
