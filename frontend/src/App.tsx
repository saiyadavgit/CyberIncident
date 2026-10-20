import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { RoleRoute } from './components/routing/RoleRoute';
import { GuestRoute } from './components/routing/GuestRoute';
import { HomeRedirect } from './components/routing/HomeRedirect';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboard';
import { ReportIncidentPage } from './pages/employee/ReportIncident';
import { MyIncidentsPage } from './pages/employee/MyIncidents';
import { IncidentDetailsPage } from './pages/incidents/IncidentDetails';
import { CopilotPage } from './pages/Copilot';
import { SocDashboardPage } from './pages/analyst/SocDashboard';
import { IncidentQueuePage } from './pages/analyst/IncidentQueue';
import { InvestigationPage } from './pages/analyst/Investigation';
import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagement';
import { AuditLogsPage } from './pages/admin/AuditLogs';
import { AnalyticsPage } from './pages/admin/Analytics';
import { NotFoundPage } from './pages/NotFound';
import { ADMIN_ROLES, ALL_ROLES, SOC_ROLES } from './utils/roles';

interface AppProps {
  /** Preview with in-browser demo data. Set to false to talk to the Spring Boot backend at VITE_API_BASE_URL. */
  demoMode?: boolean;
}

export function App({ demoMode = false }: AppProps) {
  return (
    <BrowserRouter>
      <AuthProvider demoMode={demoMode}>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgb(var(--c-raised))',
              border: '1px solid rgb(var(--c-line-strong))',
              color: 'rgb(var(--c-ink))',
              fontFamily: 'IBM Plex Sans, sans-serif'
            }
          }} />
        
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<HomeRedirect />} />

              <Route element={<RoleRoute roles={['EMPLOYEE']} />}>
                <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
              </Route>

              <Route element={<RoleRoute roles={ALL_ROLES} />}>
                <Route path="/employee/report" element={<ReportIncidentPage />} />
                <Route path="/employee/incidents" element={<MyIncidentsPage />} />
                <Route path="/incidents/:incidentId" element={<IncidentDetailsPage />} />
                <Route path="/copilot" element={<CopilotPage />} />
                <Route path="/copilot/:incidentId" element={<CopilotPage />} />
              </Route>

              <Route element={<RoleRoute roles={SOC_ROLES} />}>
                <Route path="/analyst/dashboard" element={<SocDashboardPage />} />
                <Route path="/analyst/queue" element={<IncidentQueuePage />} />
                <Route path="/analyst/investigations" element={<InvestigationPage />} />
                <Route path="/analyst/investigations/:incidentId" element={<InvestigationPage />} />
              </Route>

              <Route element={<RoleRoute roles={ADMIN_ROLES} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>);

}