package com.cyberincident.backend.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/protected")
    public ResponseEntity<Map<String, Object>> getProtectedResource() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "JWT authentication is working");
        response.put("authenticated", true);
        return ResponseEntity.ok(response);
    }
}
