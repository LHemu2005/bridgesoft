package com.bridgesoft.config;

import com.bridgesoft.entity.Permission;
import com.bridgesoft.entity.Role;
import com.bridgesoft.entity.User;
import com.bridgesoft.repository.PermissionRepository;
import com.bridgesoft.repository.RoleRepository;
import com.bridgesoft.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataInitializer {

    @Bean
    @Transactional
    public CommandLineRunner initData(
            RoleRepository roleRepository, 
            PermissionRepository permissionRepository, 
            UserRepository userRepository, 
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (roleRepository.count() == 0) {
                // Create USER Role
                Role userRole = roleRepository.save(new Role("USER", "Standard user with basic permissions"));
                permissionRepository.save(new Permission(userRole, "profile", "READ"));
                permissionRepository.save(new Permission(userRole, "profile", "UPDATE"));

                // Create ADMIN Role
                Role adminRole = roleRepository.save(new Role("ADMIN", "Administrator with full system access"));
                permissionRepository.save(new Permission(adminRole, "users", "CREATE"));
                permissionRepository.save(new Permission(adminRole, "users", "READ"));
                permissionRepository.save(new Permission(adminRole, "users", "UPDATE"));
                permissionRepository.save(new Permission(adminRole, "users", "DELETE"));
                permissionRepository.save(new Permission(adminRole, "audit_logs", "READ"));

                // Create MODERATOR Role
                Role modRole = roleRepository.save(new Role("MODERATOR", "Content moderator with review permissions"));
                permissionRepository.save(new Permission(modRole, "reports", "READ"));
                permissionRepository.save(new Permission(modRole, "reports", "UPDATE"));

                System.out.println("Default roles and permissions seeded.");
            }

            if (userRepository.count() == 0) {
                Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
                Role userRole = roleRepository.findByName("USER").orElseThrow();

                User admin = new User("admin@example.com", passwordEncoder.encode("password"), adminRole);
                admin.setEmailVerified(true);
                
                User user = new User("user@example.com", passwordEncoder.encode("password"), userRole);
                user.setEmailVerified(true);
                
                userRepository.save(admin);
                userRepository.save(user);
                System.out.println("Default users seeded.");
            }
        };
    }
}
