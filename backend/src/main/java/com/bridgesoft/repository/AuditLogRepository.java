package com.bridgesoft.repository;

import com.bridgesoft.entity.AuditLog;
import com.bridgesoft.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByUser(User user);
}
