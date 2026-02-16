import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreatePlanPage from './pages/CreatePlanPage';
import MyPlansPage from './pages/MyPlansPage';
import DailyPlannerPage from './pages/DailyPlannerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import PlanDetailPage from './pages/PlanDetailPage';

// Layout & auth
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * App – root component with React Router v6 route definitions.
 *
 * Public routes: /, /login, /signup
 * Protected routes: /dashboard, /create-plan, /plans, /daily, /analytics, /profile
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* ===== Public routes ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ===== Protected routes (wrapped in DashboardLayout) ===== */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-plan" element={<CreatePlanPage />} />
          <Route path="/plans" element={<MyPlansPage />} />
          <Route path="/plans/:id" element={<PlanDetailPage />} />
          <Route path="/daily" element={<DailyPlannerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
