package com.cyberincident.backend;

import com.cyberincident.backend.dto.*;
import com.cyberincident.backend.entity.Incident;
import com.cyberincident.backend.entity.User;
import com.cyberincident.backend.enums.IncidentSeverity;
import com.cyberincident.backend.enums.IncidentStatus;
import com.cyberincident.backend.enums.IncidentType;
import com.cyberincident.backend.enums.Role;
import com.cyberincident.backend.repository.IncidentRepository;
import com.cyberincident.backend.repository.UserRepository;
import com.cyberincident.backend.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AiControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User employee1;
    private User employee2;
    private User analyst;

    private String employee1Token;
    private String employee2Token;
    private String analystToken;

    private Incident employee1Incident;

    @BeforeEach
    void setUp() {
        incidentRepository.deleteAll();
        userRepository.deleteAll();

        // Create Employee 1
        employee1 = new User("Alice Employee", "alice@example.com", passwordEncoder.encode("password123"), Role.EMPLOYEE);
        userRepository.save(employee1);
        employee1Token = jwtService.generateToken(employee1);

        // Create Employee 2 (Unauthorized user for Employee 1's incident)
        employee2 = new User("Bob Employee", "bob@example.com", passwordEncoder.encode("password123"), Role.EMPLOYEE);
        userRepository.save(employee2);
        employee2Token = jwtService.generateToken(employee2);

        // Create Analyst
        analyst = new User("Charlie Analyst", "charlie@example.com", passwordEncoder.encode("password123"), Role.ANALYST);
        userRepository.save(analyst);
        analystToken = jwtService.generateToken(analyst);

        // Create Incident reported by Employee 1
        employee1Incident = new Incident(
                "Suspicious Phishing Email",
                "Employee received an urgent email claiming to be from IT asking for credential verification.",
                IncidentType.PHISHING,
                IncidentSeverity.HIGH,
                IncidentStatus.REPORTED,
                employee1
        );
        incidentRepository.save(employee1Incident);
    }

    @Test
    void analyzeIncident_AuthorizedOwner_Success() throws Exception {
        AiRequest request = new AiRequest(employee1Incident.getId());

        mockMvc.perform(post("/api/ai/analyze-incident")
                        .header("Authorization", "Bearer " + employee1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId", is(employee1Incident.getId().intValue())))
                .andExpect(jsonPath("$.threatSummary", notNullValue()))
                .andExpect(jsonPath("$.suggestedSeverity", notNullValue()))
                .andExpect(jsonPath("$.attackCategory", notNullValue()))
                .andExpect(jsonPath("$.riskFactors", notNullValue()))
                .andExpect(jsonPath("$.investigationSuggestions", notNullValue()))
                .andExpect(jsonPath("$.disclaimer", containsString("recommendation only")))
                .andExpect(jsonPath("$", not(hasKey("apiKey"))))
                .andExpect(jsonPath("$", not(hasKey("secret"))));
    }

    @Test
    void remediationPlan_Analyst_Success() throws Exception {
        AiRequest request = new AiRequest(employee1Incident.getId());

        mockMvc.perform(post("/api/ai/remediation-plan")
                        .header("Authorization", "Bearer " + analystToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId", is(employee1Incident.getId().intValue())))
                .andExpect(jsonPath("$.immediateActions", notNullValue()))
                .andExpect(jsonPath("$.containmentActions", notNullValue()))
                .andExpect(jsonPath("$.investigationActions", notNullValue()))
                .andExpect(jsonPath("$.recoveryActions", notNullValue()))
                .andExpect(jsonPath("$.monitoringRecommendations", notNullValue()))
                .andExpect(jsonPath("$.disclaimer", containsString("recommendations only")));
    }

    @Test
    void summarizeInvestigation_Analyst_Success() throws Exception {
        AiRequest request = new AiRequest(employee1Incident.getId());

        mockMvc.perform(post("/api/ai/summarize-investigation")
                        .header("Authorization", "Bearer " + analystToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId", is(employee1Incident.getId().intValue())))
                .andExpect(jsonPath("$.executiveSummary", notNullValue()))
                .andExpect(jsonPath("$.whatHappened", notNullValue()))
                .andExpect(jsonPath("$.impact", notNullValue()))
                .andExpect(jsonPath("$.actionsTaken", notNullValue()))
                .andExpect(jsonPath("$.currentStatus", notNullValue()))
                .andExpect(jsonPath("$.recommendedNextSteps", notNullValue()))
                .andExpect(jsonPath("$.disclaimer", containsString("recommendation only")));
    }

    @Test
    void analyzeIncident_UnauthorizedEmployee_ReturnsForbidden() throws Exception {
        // Employee 2 attempts to analyze Employee 1's incident
        AiRequest request = new AiRequest(employee1Incident.getId());

        mockMvc.perform(post("/api/ai/analyze-incident")
                        .header("Authorization", "Bearer " + employee2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("Access denied")));
    }

    @Test
    void analyzeIncident_Unauthenticated_ReturnsUnauthorized() throws Exception {
        AiRequest request = new AiRequest(employee1Incident.getId());

        mockMvc.perform(post("/api/ai/analyze-incident")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }
}
