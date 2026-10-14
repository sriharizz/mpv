import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import { SimulationProvider } from './context/SimulationContext';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { ManualCasePage } from './pages/ManualCasePage';
import { CaseProcessingPage } from './pages/CaseProcessingPage';
import { OpenCasePage } from './pages/OpenCasePage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { MedicalSourceDocPage } from './pages/MedicalSourceDocPage';

// Route guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <AuthProvider>
        <CaseProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route (Matching image_4c6b7b.png) */}
              <Route path="/login" element={<LoginPage />} />

              {/* Standalone Medical Source Document (opens in new tab target="_blank") */}
              <Route path="/medical-source-document" element={<MedicalSourceDocPage />} />

              {/* Authenticated Application Shell */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/intake/manual-case-registration" replace />} />
                <Route path="home" element={<Navigate to="/intake/manual-case-registration" replace />} />
                <Route path="intake/manual-case-registration" element={<ManualCasePage />} />
                <Route path="intake/open-case" element={<OpenCasePage />} />
                <Route path="intake/case-processing/:caseNumber" element={<CaseProcessingPage />} />
                <Route path="reports/audit-history" element={<AuditHistoryPage />} />
              </Route>

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </CaseProvider>
      </AuthProvider>
    </SimulationProvider>
  );
};

export default App;
