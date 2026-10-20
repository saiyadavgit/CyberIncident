package com.cyberincident.backend.controller;

import java.util.Collections;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoleTestController {

    @GetMapping("/api/employee/test")
    public ResponseEntity<Map<String, String>> employeeTest() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Employee access granted"));
    }

    @GetMapping("/api/analyst/test")
    public ResponseEntity<Map<String, String>> analystTest() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Analyst access granted"));
    }

    @GetMapping("/api/admin/test")
    public ResponseEntity<Map<String, String>> adminTest() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Admin access granted"));
    }
}
