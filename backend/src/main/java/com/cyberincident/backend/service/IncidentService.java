package com.cyberincident.backend.service;

import com.cyberincident.backend.dto.CreateIncidentRequest;
import com.cyberincident.backend.dto.IncidentResponse;
import com.cyberincident.backend.entity.Incident;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.enums.IncidentStatus;
import com.cyberincident.backend.enums.Role;
import com.cyberincident.backend.repository.IncidentRepository;
import com.cyberincident.backend.repository.UserRepository;
import com.cyberincident.backend.exception.ResourceNotFoundException;
import com.cyberincident.backend.exception.AccessDeniedException;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public IncidentService(
            IncidentRepository incidentRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {

        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public IncidentResponse createIncident(
            CreateIncidentRequest request,
            String userEmail) {

        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Incident incident = new Incident();

        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setType(request.getType());
        incident.setSeverity(request.getSeverity());
        incident.setStatus(IncidentStatus.REPORTED);
        incident.setReportedBy(reporter);
        incident.setAssignedTo(null);

        Incident savedIncident = incidentRepository.save(incident);

        auditLogService.logAction(
                userEmail,
                "INCIDENT_CREATED",
                savedIncident.getId(),
                null
        );

        return mapToResponse(savedIncident);
    }

    public List<IncidentResponse> getMyIncidents(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return incidentRepository.findByReportedById(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public IncidentResponse getIncidentById(
            Long incidentId,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        // Employees can only view their own incidents.
        if (user.getRole() == Role.EMPLOYEE) {

            if (!incident.getReportedBy().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied");
            }
        }

        // ANALYST and ADMIN can view any incident.
        return mapToResponse(incident);
    }

    public List<IncidentResponse> getAllIncidentsForAnalyst() {

        return incidentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public IncidentResponse mapToResponse(Incident incident) {

        Long reportedById = incident.getReportedBy() != null
                ? incident.getReportedBy().getId()
                : null;

        String reportedByName = incident.getReportedBy() != null
                ? incident.getReportedBy().getName()
                : null;

        Long assignedToId = incident.getAssignedTo() != null
                ? incident.getAssignedTo().getId()
                : null;

        String assignedToName = incident.getAssignedTo() != null
                ? incident.getAssignedTo().getName()
                : null;

        return new IncidentResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getType(),
                incident.getSeverity(),
                incident.getStatus(),
                reportedById,
                reportedByName,
                assignedToId,
                assignedToName,
                incident.getCreatedAt(),
                incident.getUpdatedAt()
        );
    }

    public IncidentResponse assignIncident(
            Long incidentId,
            String analystEmail,
            Long assigneeId) {

        User analyst = userRepository.findByEmail(analystEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (analyst.getRole() != Role.ANALYST &&
                analyst.getRole() != Role.ADMIN) {

            throw new ResourceNotFoundException("Incident not found");
        }

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        if (assignee.getRole() != Role.ANALYST) {

            throw new RuntimeException(
                    "Incident can only be assigned to an analyst"
            );
        }

        incident.setAssignedTo(assignee);

        Incident savedIncident = incidentRepository.save(incident);

        auditLogService.logAction(
                analystEmail,
                "INCIDENT_ASSIGNED",
                incidentId,
                null
        );

        return mapToResponse(savedIncident);
    }

    public IncidentResponse updateIncidentStatus(
            Long incidentId,
            String analystEmail,
            IncidentStatus newStatus) {

        User analyst = userRepository.findByEmail(analystEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (analyst.getRole() != Role.ANALYST &&
                analyst.getRole() != Role.ADMIN) {

            throw new AccessDeniedException("Access denied");
        }

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        IncidentStatus currentStatus = incident.getStatus();

        if (!isValidTransition(currentStatus, newStatus)) {

            throw new RuntimeException(
                    "Invalid incident status transition: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        incident.setStatus(newStatus);

        Incident savedIncident = incidentRepository.save(incident);

        auditLogService.logAction(
                analystEmail,
                "INCIDENT_STATUS_UPDATED",
                incidentId,
                null
        );

        return mapToResponse(savedIncident);
    }

    private boolean isValidTransition(
            IncidentStatus currentStatus,
            IncidentStatus newStatus) {

        if (currentStatus == null || newStatus == null) {
            return false;
        }

        switch (currentStatus) {

            case REPORTED:
                return newStatus == IncidentStatus.TRIAGED;

            case TRIAGED:
                return newStatus == IncidentStatus.INVESTIGATING;

            case INVESTIGATING:
                return newStatus == IncidentStatus.CONTAINED;

            case CONTAINED:
                return newStatus == IncidentStatus.RESOLVED;

            case RESOLVED:
                return newStatus == IncidentStatus.CLOSED;

            case CLOSED:
                return false;

            default:
                return false;
        }
    }
}