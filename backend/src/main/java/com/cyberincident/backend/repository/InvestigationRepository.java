package com.cyberincident.backend.repository;

import com.cyberincident.backend.entity.Investigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvestigationRepository extends JpaRepository<Investigation, Long> {

    Optional<Investigation> findByIncidentId(Long incidentId);

    Optional<Investigation> findByAnalystId(Long analystId);
}