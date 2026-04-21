package com.bridgesoft.security;

import com.bridgesoft.entity.Role;
import com.bridgesoft.entity.User;
import com.bridgesoft.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // uses application-test.yml and avoids actual Postgres binding
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.bridgesoft.repository.RoleRepository roleRepository;

    private String validUserToken;
    private String validAdminToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll(); // clear h2 db
        
        Role userRole = roleRepository.findByName("USER").orElseThrow();
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        
        User normalUser = new User("user_test@example.com", "hash", userRole);
        User adminUser = new User("admin_test@example.com", "hash", adminRole);
        
        userRepository.save(normalUser);
        userRepository.save(adminUser);

        validUserToken = jwtService.generateToken(normalUser, normalUser.getRole().getName());
        validAdminToken = jwtService.generateToken(adminUser, adminUser.getRole().getName());
    }

    @Test
    void testMissingAuthorizationHeader() throws Exception {
        // We lack an /api/admin/data endpoint but any unknown path requires authentication due to `.anyRequest().authenticated()`
        mockMvc.perform(get("/api/secured/data"))
               .andExpect(status().isForbidden()); // Spring security defaults to 403 when authentication is missing and unauthorized entry point isn't explicitly 401
    }

    @Test
    void testMalformedBearerToken() throws Exception {
        mockMvc.perform(get("/api/secured/data")
                .header(HttpHeaders.AUTHORIZATION, "Bearer my_fake_string"))
               .andExpect(status().isForbidden()); // Filter will catch MalformedJwtException and clear context, resulting in Forbidden
    }

    @Test
    void testLowerTierPrivilegeEscalationAttempt() throws Exception {
        // Our SecurityConfig has .requestMatchers("/api/admin/**").hasRole("ADMIN")
        // If a USER role accesses it, should be 403 forbidden.
        mockMvc.perform(get("/api/admin/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validUserToken))
               .andExpect(status().isForbidden());
    }
    
    @Test
    void testValidAdminAccess() throws Exception {
        // But an ADMIN mapping should get past auth check (it will return 404 because controller doesn't exist, but NOT 403)
        mockMvc.perform(get("/api/admin/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validAdminToken))
               .andExpect(status().isNotFound());
    }
}
