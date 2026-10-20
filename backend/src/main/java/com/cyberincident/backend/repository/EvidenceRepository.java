package com.cyberincident.backend.repository;

import com.cyberincident.backend.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    List<Evidence> findByIncidentId(Long incidentId);

    List<Evidence> findByUploadedById(Long userId);
}