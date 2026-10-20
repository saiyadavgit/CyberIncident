package com.cyberincident.backend.service;

import com.cyberincident.backend.dto.EvidenceResponse;
import com.cyberincident.backend.entity.Evidence;
import com.cyberincident.backend.entity.Incident;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.repository.EvidenceRepository;
import com.cyberincident.backend.repository.IncidentRepository;
import com.cyberincident.backend.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final FileValidationService fileValidationService;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    public EvidenceService(
            EvidenceRepository evidenceRepository,
            IncidentRepository incidentRepository,
            UserRepository userRepository,
            FileValidationService fileValidationService,
            FileStorageService fileStorageService,
            AuditLogService auditLogService) {

        this.evidenceRepository = evidenceRepository;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.fileValidationService = fileValidationService;
        this.fileStorageService = fileStorageService;
        this.auditLogService = auditLogService;
    }

    public EvidenceResponse uploadEvidence(
            Long incidentId,
            MultipartFile file,
            String userEmail) {

        fileValidationService.validate(file);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String storedFileName =
                fileStorageService.storeFile(file);

        Evidence evidence = new Evidence();

        evidence.setOriginalFileName(file.getOriginalFilename());
        evidence.setStoredFileName(storedFileName);
        evidence.setFilePath(storedFileName);
        evidence.setContentType(file.getContentType());
        evidence.setFileSize(file.getSize());
        evidence.setIncident(incident);
        evidence.setUploadedBy(user);

        Evidence savedEvidence =
                evidenceRepository.save(evidence);

        auditLogService.logAction(
                userEmail,
                "EVIDENCE_UPLOADED",
                incidentId,
                null
        );

        return mapToResponse(savedEvidence);
    }

    public List<EvidenceResponse> getEvidenceForIncident(
            Long incidentId,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        boolean isPrivileged =
                user.getRole().name().equals("ANALYST")
                        || user.getRole().name().equals("ADMIN");

        if (!isPrivileged &&
                !incident.getReportedBy().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this evidence"
            );
        }

        return evidenceRepository
                .findByIncidentId(incidentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Resource downloadEvidence(
            Long incidentId,
            Long evidenceId,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Verify that the incident from the URL actually exists
        Incident requestedIncident =
                incidentRepository.findById(incidentId)
                        .orElseThrow(() ->
                                new RuntimeException("Incident not found"));

        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() ->
                        new RuntimeException("Evidence not found"));

        Incident evidenceIncident = evidence.getIncident();

        // IDOR protection:
        // Evidence must belong to the incident from the URL.
        if (!evidenceIncident.getId().equals(requestedIncident.getId())) {

            throw new RuntimeException(
                    "Evidence does not belong to this incident"
            );
        }

        boolean isPrivileged =
                user.getRole().name().equals("ANALYST")
                        || user.getRole().name().equals("ADMIN");

        if (!isPrivileged &&
                !evidenceIncident.getReportedBy()
                        .getId()
                        .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to download this evidence"
            );
        }

        try {

            Path storagePath = Paths.get(
                    "uploads/evidence"
            )
                    .toAbsolutePath()
                    .normalize();

            Path filePath = storagePath
                    .resolve(evidence.getStoredFileName())
                    .normalize();

            // Path traversal protection
            if (!filePath.getParent().equals(storagePath)) {
                throw new RuntimeException("Invalid file path");
            }

            Resource resource =
                    new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException(
                        "Evidence file not found"
                );
            }

            return resource;

        } catch (MalformedURLException exception) {

            throw new RuntimeException(
                    "Could not access evidence file"
            );
        }
    }

    private EvidenceResponse mapToResponse(Evidence evidence) {

        return new EvidenceResponse(
                evidence.getId(),
                evidence.getOriginalFileName(),
                evidence.getContentType(),
                evidence.getFileSize(),
                evidence.getIncident().getId(),
                evidence.getUploadedBy().getId(),
                evidence.getUploadedBy().getName(),
                evidence.getUploadedAt()
        );
    }
}