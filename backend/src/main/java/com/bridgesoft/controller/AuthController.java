package com.bridgesoft.controller;

import com.bridgesoft.entity.Role;
import com.bridgesoft.entity.User;
import com.bridgesoft.repository.UserRepository;
import com.bridgesoft.repository.RoleRepository;
import com.bridgesoft.repository.AuditLogRepository;
import com.bridgesoft.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, 
                          UserRepository userRepository, RoleRepository roleRepository,
                          AuditLogRepository auditLogRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    record LoginRequest(String email, String password, boolean social, String phone) {}
    record RegisterRequest(String email, String password, String phone) {}
    record ForgotPasswordRequest(String email) {}
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        try {
            User user;
            if (request.social() || (request.phone() != null && !request.phone().isEmpty())) {
                // For social/phone login, we trust the Firebase token verification from frontend
                // and either find or create the user
                if (request.email() != null) {
                    user = userRepository.findByEmail(request.email())
                        .orElseGet(() -> createSocialUser(request.email()));
                } else if (request.phone() != null) {
                    user = userRepository.findByPhoneNumber(request.phone())
                        .orElseGet(() -> createPhoneUser(request.phone()));
                } else {
                    throw new RuntimeException("No identifying information provided.");
                }
            } else {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.email(), request.password())
                );
                user = userRepository.findByEmail(request.email()).orElseThrow();
            }
            
            user.setLastLogin(java.time.LocalDateTime.now());
            userRepository.save(user);

            String jwt = jwtService.generateToken(user, user.getRole().getName());

            // Audit Log
            auditLogRepository.save(new com.bridgesoft.entity.AuditLog(
                user, "LOGIN", request.social() ? "SOCIAL" : "SESSION", "success", ipAddress, java.util.Map.of("email", user.getEmail())
            ));

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "user", Map.of("email", user.getEmail(), "role", user.getRole().getName()),
                    "token", jwt
            ));
        } catch (Exception e) {
            // Audit Log for failure
            auditLogRepository.save(new com.bridgesoft.entity.AuditLog(
                null, "LOGIN", "SESSION", "failure", ipAddress, java.util.Map.of("email", request.email(), "error", e.getMessage())
            ));

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", "error",
                    "error", "Authentication failed"
            ));
        }
    }

    private User createSocialUser(String email) {
        Role userRole = roleRepository.findByName("USER").orElseThrow();
        User newUser = new User(email, passwordEncoder.encode("SOCIAL_LOGIN_" + java.util.UUID.randomUUID()), userRole);
        newUser.setPhoneVerified(true);
        return userRepository.save(newUser);
    }

    private User createPhoneUser(String phone) {
        Role userRole = roleRepository.findByName("USER").orElseThrow();
        // For phone-only users, we use a placeholder email or just leave it null if the DB allows
        // To keep it simple and compatible, we'll generate a placeholder email
        String placeholderEmail = "phone_" + phone.replace("+", "") + "@bridgesoft.user";
        User newUser = new User(placeholderEmail, passwordEncoder.encode("PHONE_LOGIN_" + java.util.UUID.randomUUID()), userRole);
        newUser.setPhoneNumber(phone);
        newUser.setPhoneVerified(true);
        return userRepository.save(newUser);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "error", "Email already registered"
            ));
        }
        
        Role userRole = roleRepository.findByName("USER").orElseThrow();
        
        User newUser = new User(
            request.email(), 
            passwordEncoder.encode(request.password()), 
            userRole
        );
        newUser.setPhoneNumber(request.phone());
        newUser.setPhoneVerified(true); // Trusting frontend verification for this stage
        userRepository.save(newUser);
        
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "User registered successfully"
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return userRepository.findByEmail(request.email()).map(user -> {
            String tempPassword = "temp123_Reset!";
            user.setPasswordHash(passwordEncoder.encode(tempPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "tempPassword", tempPassword
            ));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", "error",
                "error", "Email not found"
        )));
    }
}
