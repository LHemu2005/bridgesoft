package com.bridgesoft.controller;

import com.bridgesoft.entity.AuditLog;
import com.bridgesoft.entity.User;
import com.bridgesoft.repository.AuditLogRepository;
import com.bridgesoft.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<java.util.Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<java.util.Map<String, Object>> response = users.stream().map(u -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().getName());
            map.put("phone", u.getPhoneNumber() != null ? u.getPhoneNumber() : "N/A");
            map.put("verified", u.isPhoneVerified());
            map.put("lastLogin", u.getLastLogin() != null ? u.getLastLogin().toString() : "Never");
            map.put("createdAt", u.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }
}
