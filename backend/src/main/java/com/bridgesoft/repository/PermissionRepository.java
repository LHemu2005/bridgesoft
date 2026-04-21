package com.bridgesoft.repository;

import com.bridgesoft.entity.Permission;
import com.bridgesoft.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    List<Permission> findByRole(Role role);
}
