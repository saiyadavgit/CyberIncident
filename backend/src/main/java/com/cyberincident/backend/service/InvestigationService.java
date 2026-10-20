package com.cyberincident.backend.service;

import com.cyberincident.backend.dto.CreateInvestigationRequest;
import com.cyberincident.backend.dto.InvestigationResponse;
import com.cyberincident.backend.entity.Incident;
import com.cyberincident.backend.entity.Investigation;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.enums.IncidentStatus;
import com.cyberincident.backend.enums.Role;
import com.cyberincident.backend.repository.IncidentRepository;
import com.cyberincident.backend.repository.InvestigationRepository;
import com.cyberincident.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class InvestigationService {

    private final InvestigationRepository investigationRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public InvestigationService(
            InvestigationRepository investigationRepository,
            IncidentRepository incidentRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {

        this.investigationRepository = investigationRepository;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public InvestigationResponse createInvestigation(
            CreateInvestigationRequest request,
            String analystEmail) {

        User analyst = userRepository.findByEmail(analystEmail)
                .orElseThrow(() ->
                        new RuntimeException("Analyst not found"));

        if (analyst.getRole() != Role.ANALYST &&
                analyst.getRole() != Role.ADMIN) {

            throw new RuntimeException("Access denied");
        }

        Incident incident = incidentRepository
                .findById(request.getIncidentId())
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        if (investigationRepository
                .findByIncidentId(incident.getId())
                .isPresent()) {

            throw new RuntimeException(
                    "Investigation already exists for this incident"
            );
        }

        /*
         * Investigation can only start after
         * the incident has been TRIAGED.
         */
        if (incident.getStatus() != IncidentStatus.TRIAGED) {

            throw new RuntimeException(
                    "Investigation can only be started for a TRIAGED incident"
            );
        }

        Investigation investigation = new Investigation();

        investigation.setIncident(incident);
        investigation.setAnalyst(analyst);
        investigation.setFindings(request.getFindings());
        investigation.setActionsTaken(request.getActionsTaken());

        /*
         * Move incident from TRIAGED to INVESTIGATING
         * when investigation is created.
         */
        incident.setStatus(IncidentStatus.INVESTIGATING);
        incidentRepository.save(incident);

        Investigation savedInvestigation =
                investigationRepository.save(investigation);

        auditLogService.logAction(
                analystEmail,
                "INVESTIGATION_CREATED",
                incident.getId(),
                null
        );

        return mapToResponse(savedInvestigation);
    }

    public InvestigationResponse getInvestigationByIncidentId(
            Long incidentId,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Incident incident = incidentRepository
                .findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        if (user.getRole() == Role.EMPLOYEE &&
                !incident.getReportedBy()
                        .getId()
                        .equals(user.getId())) {

            throw new RuntimeException("Access denied");
        }

        Investigation investigation = investigationRepository
                .findByIncidentId(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Investigation not found"));

        return mapToResponse(investigation);
    }

    public InvestigationResponse updateInvestigation(
            Long incidentId,
            CreateInvestigationRequest request,
            String analystEmail) {

        User analyst = userRepository.findByEmail(analystEmail)
                .orElseThrow(() ->
                        new RuntimeException("Analyst not found"));

        if (analyst.getRole() != Role.ANALYST &&
                analyst.getRole() != Role.ADMIN) {

            throw new RuntimeException("Access denied");
        }

        Investigation investigation = investigationRepository
                .findByIncidentId(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Investigation not found"));

        investigation.setFindings(request.getFindings());
        investigation.setActionsTaken(request.getActionsTaken());

        Investigation updatedInvestigation =
                investigationRepository.save(investigation);

        auditLogService.logAction(
                analystEmail,
                "INVESTIGATION_UPDATED",
                incidentId,
                null
        );

        return mapToResponse(updatedInvestigation);
    }

    private InvestigationResponse mapToResponse(
            Investigation investigation) {

        InvestigationResponse response =
                new InvestigationResponse();

        Incident incident = investigation.getIncident();
        User analyst = investigation.getAnalyst();

        response.setId(investigation.getId());

        response.setIncidentId(incident.getId());
        response.setIncidentTitle(incident.getTitle());

        response.setAnalystId(analyst.getId());
        response.setAnalystName(analyst.getName());

        response.setFindings(investigation.getFindings());
        response.setActionsTaken(
                investigation.getActionsTaken()
        );

        response.setIncidentStatus(
                incident.getStatus()
        );

        response.setCreatedAt(
                investigation.getCreatedAt()
        );

        response.setUpdatedAt(
                investigation.getUpdatedAt()
        );

        return response;
    }
}