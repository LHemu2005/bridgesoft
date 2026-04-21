package com.bridgesoft.repository;

import com.bridgesoft.entity.Session;
import com.bridgesoft.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    Optional<Session> findByJwtTokenHash(String jwtTokenHash);
    void deleteByUser(User user);
}
