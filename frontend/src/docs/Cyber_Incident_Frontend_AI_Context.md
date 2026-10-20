Cyber Incident Management System
Frontend Specification & Integration Context

Document for AI Frontend/UI Tools — Existing React Frontend Context

# 1. Project Overview

This project is a Cybersecurity Incident Management System / Security Operations Center (SOC) application. The frontend is a React/Vite application connected to an existing Java Spring Boot backend and MySQL database. The frontend must be redesigned visually without breaking existing functionality, API contracts, authentication, RBAC, or backend behavior.

# 2. Frontend Technology Stack

- React 19 + React DOM 19

- Vite

- React Router DOM v7

- Axios for API communication

- Tailwind CSS v4

- Lucide React for icons

- Framer Motion for UI motion

- Recharts for analytics/charts

# 3. Existing Frontend Architecture

frontend/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── employee/
│   │   ├── analyst/
│   │   └── admin/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── index.css
├── public/
├── package.json
├── vite.config.js
└── index.html

# 4. Authentication & Session Handling

The frontend already has centralized authentication and JWT handling.

- AuthContext.jsx stores the authenticated user and token state.

- useAuth.js provides authentication state/actions to components.

- authService.js handles login/register API calls.

- JWT is persisted in localStorage for session persistence.

- api.js is the centralized Axios client and attaches the JWT Bearer token to requests.

- 401/403 responses are handled centrally.

- ProtectedRoute.jsx protects authenticated routes.

- RoleRoute.jsx provides role-based route protection.

# 5. User Roles / RBAC

- EMPLOYEE — reports incidents, views own incidents/evidence and permitted AI analysis.

- ANALYST — manages incident queue, assignment, status workflow, investigations and privileged incident access.

- ADMIN — user/role management, audit logs, analytics and privileged access.

# 6. Existing Shared Components

- Navbar.jsx

- Sidebar.jsx

- MainLayout.jsx

- AuthLayout.jsx

- ProtectedRoute.jsx

- RoleRoute.jsx

- SeverityBadge

- StatusBadge

- StatCard

- PageHeader

- EmptyState

- LoadingState

- ErrorState

- SearchInput

- FilterBar

- Modal

- ConfirmDialog

- IncidentTable

- Timeline

- EvidenceList

- AiCopilotPanel

# 7. Existing Pages / Screens

- LoginPage.jsx — user authentication.

- RegisterPage.jsx — new user registration.

- EmployeeDashboardPage.jsx — employee overview.

- ReportIncidentPage.jsx — incident reporting form.

- MyIncidentsPage.jsx — employee's incidents.

- IncidentDetailsPage.jsx — detailed incident view, evidence, investigation and AI Copilot.

- SocDashboardPage.jsx — analyst/SOC overview.

- IncidentQueuePage.jsx — analyst incident queue and management.

- InvestigationPage.jsx — investigation workflow.

- AdminDashboardPage.jsx — admin overview.

- UserManagementPage.jsx — users and role management.

- AuditLogsPage.jsx — audit trail.

- AnalyticsPage.jsx — incident/audit analytics.

- NotFoundPage.jsx — 404 page.

# 8. Frontend Services / API Integration

The following service modules centralize communication with the existing Spring Boot backend:

- api.js — Axios instance, base URL and JWT handling.

- authService.js — authentication.

- incidentService.js — incident CRUD/queries, assignment/status operations.

- investigationService.js — investigation creation, retrieval and updates.

- evidenceService.js — evidence upload/list/download.

- adminService.js — user list and role management, admin operations.

- analyticsService.js — incident and audit analytics.

- aiService.js — Groq-backed AI endpoints.

# 9. Important Backend API Contracts Used by Frontend

## Authentication

- POST /api/auth/register

- POST /api/auth/login

## Health

- GET /api/health

## Employee / Incident APIs

- POST /api/incidents

- GET /api/employee/incidents

- GET /api/incidents/{incidentId}

- POST /api/incidents/{incidentId}/evidence

- GET /api/incidents/{incidentId}/evidence

- GET /api/incidents/{incidentId}/evidence/{evidenceId}/download

## Analyst APIs

- GET /api/analyst/incidents

- POST /api/analyst/incidents/{incidentId}/assign?assigneeId={id}

- POST /api/analyst/incidents/{incidentId}/status?status={status}

- POST /api/analyst/incidents/{incidentId}/investigation

- PUT /api/analyst/incidents/{incidentId}/investigation

## Admin APIs

- GET /api/admin/users

- PUT /api/admin/users/{userId}/role

- GET /api/admin/audit-logs

## Analytics APIs

- GET /api/analytics/incidents

- GET /api/analytics/audit

## AI APIs

- POST /api/ai/analyze-incident

- POST /api/ai/remediation-plan

- POST /api/ai/summarize-investigation

# 10. Incident Data / Workflow Context

Incident types currently supported:

- PHISHING

- MALWARE

- SUSPICIOUS_LOGIN

- UNAUTHORIZED_ACCESS

- DATA_BREACH

- PASSWORD_COMPROMISE

- OTHER

Severity levels:

- LOW

- MEDIUM

- HIGH

- CRITICAL

Incident lifecycle:

REPORTED → TRIAGED → INVESTIGATING → CONTAINED → RESOLVED → CLOSED

# 11. Evidence / Security UX

- Evidence can be uploaded against an incident.

- Supported evidence includes PNG, JPEG, PDF, text/plain and CSV.

- Maximum upload size is 10 MB.

- The backend performs file validation and IDOR/path traversal protection.

- Frontend should clearly communicate upload state, success, failure and evidence metadata.

- Do not expose backend storage paths or secrets in the UI.

# 12. Groq AI Copilot

The frontend already contains an AI Copilot panel on Incident Details. It communicates only with the Spring Boot AI endpoints; the Groq API key is backend-only and must never be placed in the frontend.

- Analyze Incident — produces AI-assisted incident analysis.

- Generate Remediation Plan — produces recommended remediation actions.

- Summarize Investigation — summarizes available investigation information.

- AI output is advisory and must not automatically mutate incident severity/status.

- RBAC/incident ownership remains enforced by the backend.

# 13. Required Redesign Direction

The current frontend functionality should be preserved, but the visual system should be transformed into a premium, production-quality Cybersecurity SOC / Security Command Center.

- Dark, sophisticated cybersecurity visual language.

- Strong typography, spacing and hierarchy.

- Avoid generic SaaS-dashboard appearance.

- Avoid excessive gradients, excessive glassmorphism and random decorative effects.

- Use 3D only where it adds meaning: threat/network visualization, command-center atmosphere, incident visualization.

- Use GSAP for cinematic entrances, transitions, counters, timeline movement and 3D scene animation where appropriate.

- Use Framer Motion for polished UI micro-interactions.

- Use Recharts for meaningful analytics.

- Maintain excellent accessibility, responsiveness and readable contrast.

- Keep the interface professional enough for a high-end portfolio and real SOC-style application.

# 14. Suggested Visual Treatment by Screen

Login: Strong visual identity, subtle 3D cybersecurity/network scene, cinematic entrance animation.

Register: Same design system as Login, lighter animation load.

Employee Dashboard: Clean command-center overview with incident status, recent activity and useful visualizations.

Report Incident: Premium secure form with clear severity/type selection and evidence upload experience.

My Incidents: High-quality searchable/filterable incident workspace.

SOC Dashboard: Most visually impressive screen: threat overview, live-looking network/incident visualization, metrics, severity distribution and recent incidents.

Incident Queue: Dense but elegant analyst workspace optimized for scanning and triage.

Incident Details: Strong incident identity, severity/status visualization, timeline, evidence, investigation and AI Copilot.

Investigation: Investigation workspace with findings/actions, timeline and clear workflow state.

Admin Dashboard: Professional administrative command center.

User Management: Clean secure table with role management and confirmations.

Audit Logs: Security-focused audit timeline/table with filters.

Analytics: Data-dense but visually polished charts and metrics.

# 15. Non-Negotiable Preservation Rules

- DO NOT replace the Spring Boot backend.

- DO NOT invent new APIs when an existing API already supports the feature.

- DO NOT remove existing routes or role restrictions.

- DO NOT replace real API data with mock/static data.

- DO NOT put Groq/API/database secrets in frontend code.

- DO NOT break Axios JWT handling.

- DO NOT remove evidence, investigation, audit, analytics or AI functionality.

- DO NOT change backend contracts unless explicitly requested.

- All existing functionality must remain usable after the redesign.

# 16. Frontend Environment

VITE_API_BASE_URL=http://localhost:8080

Only the frontend API base URL belongs in the frontend environment configuration. Groq credentials and other backend secrets must remain server-side.

# 17. Current Build / Integration Status

- The frontend was successfully built with Vite after the existing functionality and AI integration were implemented.

- The frontend is already connected to the Spring Boot backend.

- Authentication, RBAC, incidents, investigations, evidence, admin operations, analytics and AI integration are implemented.

- The purpose of giving this document to a UI AI is primarily visual redesign and frontend improvement, not rebuilding backend functionality.

# 18. Prompt to Give Along With This Document

Use this document as the functional and technical source of truth for the existing frontend. Redesign the UI/UX without removing functionality. Do not create a generic new application. First understand the existing pages, roles, API contracts, data flow and AI features described here. Then create a premium, distinctive Cybersecurity SOC / Security Command Center design system and apply it consistently. Prioritize visual quality, usability, hierarchy, meaningful 3D visualization, GSAP animation and polished micro-interactions. All existing API integrations, authentication, JWT handling, RBAC, routes and backend behavior must remain compatible.

# 19. Important Note

This document is a functional/context specification compiled from the current project information available in the conversation. It is intended to let a frontend AI understand the existing application's architecture and behavior without receiving the complete frontend source ZIP. For exact source-code-level preservation, the actual repository remains the authoritative source.
