package com.bridgesoft.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
            "status", "online",
            "message", "BridgeSoft Backend API is running",
            "documentation", "/api/auth/login [POST]"
        );
    }
}
