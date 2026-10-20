package com.cyberincident.backend.repository;

import com.cyberincident.backend.entity.Incident;
import com.cyberincident.backend.enums.IncidentSeverity;
import com.cyberincident.backend.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByReportedById(Long userId);

    List<Incident> findByAssignedToId(Long userId);

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findBySeverity(IncidentSeverity severity);

    long countByStatus(IncidentStatus status);

    long countBySeverity(IncidentSeverity severity);
}