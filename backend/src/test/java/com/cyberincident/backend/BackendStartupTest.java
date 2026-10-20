package com.cyberincident.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class BackendStartupTest {

    @Test
    void contextLoads() {
        // Verifies backend application context loads successfully without errors
    }
}
