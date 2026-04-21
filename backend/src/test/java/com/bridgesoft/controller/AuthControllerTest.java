package com.bridgesoft.controller;

import com.bridgesoft.entity.Role;
import com.bridgesoft.entity.User;
import com.bridgesoft.repository.UserRepository;
import com.bridgesoft.repository.RoleRepository;
import com.bridgesoft.repository.AuditLogRepository;
import com.bridgesoft.security.JwtAuthenticationFilter;
import com.bridgesoft.security.JwtService;
import com.bridgesoft.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private AuditLogRepository auditLogRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private Role mockUserRole;

    @BeforeEach
    void setUp() {
        mockUserRole = new Role("USER", "User Role");
    }

    @Test
    void testValidRegistrationHappyPath() throws Exception {
        Mockito.when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        Mockito.when(roleRepository.findByName("USER")).thenReturn(Optional.of(mockUserRole));
        Mockito.when(passwordEncoder.encode(anyString())).thenReturn("hashedPwd");
        
        AuthController.RegisterRequest request = new AuthController.RegisterRequest("new@example.com", "password123", "1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
                
        Mockito.verify(userRepository, Mockito.times(1)).save(any(User.class));
    }

    @Test
    void testDuplicateEmailRegistration() throws Exception {
        User existingUser = new User("duplicate@example.com", "hash", mockUserRole);
        Mockito.when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));
        
        AuthController.RegisterRequest request = new AuthController.RegisterRequest("duplicate@example.com", "password123", "1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already registered"));
                
        Mockito.verify(userRepository, Mockito.never()).save(any(User.class));
    }

    @Test
    void testSuccessfulLoginBCryptMatching() throws Exception {
        User existingUser = new User("user@example.com", "hash", mockUserRole);
        Mockito.when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
               .thenReturn(null);
        Mockito.when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));
        Mockito.when(jwtService.generateToken(any(User.class), anyString())).thenReturn("mockedJwtToken");
        
        AuthController.LoginRequest request = new AuthController.LoginRequest("user@example.com", "password123", false, null);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mockedJwtToken"))
                .andExpect(jsonPath("$.user.role").value("USER"));
                
        Mockito.verify(jwtService, Mockito.times(1)).generateToken(any(User.class), anyString());
    }

    @Test
    void testMalformedLoginJsonPayload() throws Exception {
        // Missing "email" and "password" formatting via sending an empty JSON structure {}
        // Since we bypassed the AuthenticationManager filter layer with addFilters=false, 
        // the AuthController itself relies on authenticationManager.authenticate() which we Mocked.
        Mockito.when(authenticationManager.authenticate(any()))
               .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad Data"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"incorrectField\": \"badData\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
                
        // Sending fully invalid non-JSON format
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid_json_format"))
                .andExpect(status().isBadRequest());
    }
}
