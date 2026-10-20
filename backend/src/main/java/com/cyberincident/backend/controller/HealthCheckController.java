package com.cyberincident.backend.controller;

import com.cyberincident.backend.dto.HealthCheckResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthCheckController {

    @GetMapping("/health")
    public HealthCheckResponse getHealthStatus() {
        return new HealthCheckResponse("UP", "Cyber Incident Management Backend is running");
    }
}
