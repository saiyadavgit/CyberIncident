package com.cyberincident.backend.repository;

import com.cyberincident.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserId(Long userId);

    List<AuditLog> findByIncidentId(Long incidentId);

    List<AuditLog> findAllByOrderByTimestampDesc();

    long countByAction(String action);
}