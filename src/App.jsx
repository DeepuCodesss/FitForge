import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Landing from "./pages/Landing";
import MemberLogin from "./pages/MemberLogin";
import MemberSignup from "./pages/MemberSignup";
import AdminLogin from "./pages/AdminLogin";

import MemberLayout from "./layouts/MemberLayout";
import Dashboard from "./pages/member/Dashboard";
import Profile from "./pages/member/Profile";
import Attendance from "./pages/member/Attendance";
import WorkoutPlan from "./pages/member/WorkoutPlan";
import DietPlan from "./pages/member/DietPlan";
import ProgressPage from "./pages/member/Progress";
import FeeStatus from "./pages/member/FeeStatus";
import Notifications from "./pages/member/Notifications";
import Feedback from "./pages/member/Feedback";
import Settings from "./pages/member/Settings";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminMemberDetail from "./pages/admin/AdminMemberDetail";
import AdminFeedback from "./pages/admin/AdminFeedback";

function RequireMember({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session || session.role !== "member") return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session || session.role !== "admin") return <Navigate to="/admin/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<MemberLogin />} />
      <Route path="/signup" element={<MemberSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/portal"
        element={
          <RequireMember>
            <MemberLayout />
          </RequireMember>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="workout" element={<WorkoutPlan />} />
        <Route path="diet" element={<DietPlan />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="fees" element={<FeeStatus />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="members/:id" element={<AdminMemberDetail />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
