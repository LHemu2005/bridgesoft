package com.bridgesoft.security;

import com.bridgesoft.entity.Role;
import com.bridgesoft.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User mockUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Inject secret using reflection since it relies on @Value
        ReflectionTestUtils.setField(jwtService, "secretKey", "MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        Role adminRole = new Role("ADMIN", "Admin Role");
        mockUser = new User("admin@example.com", "hash", adminRole);
    }

    @Test
    void testTokenGenerationAndClaimsIntegrity() {
        String token = jwtService.generateToken(mockUser, mockUser.getRole().getName());
        
        assertNotNull(token);
        
        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("admin@example.com", extractedUsername);
        
        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        assertEquals("ADMIN", role);
        
        Date expiration = jwtService.extractClaim(token, Claims::getExpiration);
        assertNotNull(expiration);
        // Verify expiration is in the future
        assertTrue(expiration.getTime() > System.currentTimeMillis());
    }

    @Test
    void testTamperedTokenSignatureRejection() {
        String token = jwtService.generateToken(mockUser, mockUser.getRole().getName());
        // Tamper with the token payload
        String tamperedToken = token + "tampered";

        assertThrows(SignatureException.class, () -> {
            jwtService.extractUsername(tamperedToken);
        });
    }
}
