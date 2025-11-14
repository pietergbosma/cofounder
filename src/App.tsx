import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EnvironmentDiagnostic, setupEnvironmentDiagnostic } from './components/EnvironmentDiagnostic';
import { VersionBanner } from './components/VersionBanner';

// Setup environment diagnostic on app start
setupEnvironmentDiagnostic();

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { BrowseProjectsPage } from './pages/BrowseProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { MyProjectsPage } from './pages/MyProjectsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EditProjectPage } from './pages/EditProjectPage';
import { ApplicationsManagementPage } from './pages/ApplicationsManagementPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { MRRDashboardPage } from './pages/MRRDashboardPage';
// Investor Pages
import { InvestmentOpportunitiesPage } from './pages/InvestmentOpportunitiesPage';
import { InvestorDashboardPage } from './pages/InvestorDashboardPage';
import { InvestorPortfolioPage } from './pages/InvestorPortfolioPage';
import { InvestmentOpportunityDetailPage } from './pages/InvestmentOpportunityDetailPage';
import { CreateInvestmentRoundPage } from './pages/CreateInvestmentRoundPage';
import { ReviewInvestorPage } from './pages/ReviewInvestorPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirects to home if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowseProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects/new"
            element={
              <ProtectedRoute>
                <CreateProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects/:projectId/edit"
            element={
              <ProtectedRoute>
                <EditProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects/:projectId/applications"
            element={
              <ProtectedRoute>
                <ApplicationsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mrr-dashboard"
            element={
              <ProtectedRoute>
                <MRRDashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Investor Routes */}
          <Route
            path="/investor-dashboard"
            element={
              <ProtectedRoute>
                <InvestorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investment-opportunities"
            element={
              <ProtectedRoute>
                <InvestmentOpportunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investment-opportunities/:roundId"
            element={
              <ProtectedRoute>
                <InvestmentOpportunityDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor-portfolio"
            element={
              <ProtectedRoute>
                <InvestorPortfolioPage />
              </ProtectedRoute>
            }
          />
          
          {/* Investment Round Management */}
          <Route
            path="/my-projects/:projectId/create-round"
            element={
              <ProtectedRoute>
                <CreateInvestmentRoundPage />
              </ProtectedRoute>
            }
          />
          
          {/* Review Investor */}
          <Route
            path="/review-investor/:investorId/:projectId"
            element={
              <ProtectedRoute>
                <ReviewInvestorPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <EnvironmentDiagnostic />
        <VersionBanner />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
