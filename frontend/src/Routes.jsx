
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/Signup";
import ConsumerDashboardPage from "./pages/ConsumerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/HelpAgent";

// normalising role


export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const role = user?.role;

  const getDashboard = () => {
    if (!user) return "/login";

    switch (role) {
      case "admin":
        return "/admin";
      case "consumer":
        return "/dashboard";
      case "agent":
        return "/agent";
      case "pending":
      default:
        return "/login";
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDashboard()} replace />} />

      <Route
        path="/login"
        element={!user || role === "pending" ? <LoginPage /> : <Navigate to={getDashboard()} replace />}
      />

      <Route
        path="/register"
        element={!user || role === "pending" ? <SignupPage /> : <Navigate to={getDashboard()} replace />}
      />

      <Route
        path="/dashboard"
        element={role === "consumer" ? <ConsumerDashboardPage /> : <Navigate to={getDashboard()} replace />}
      />

      <Route
        path="/admin"
        element={role === "admin" ? <AdminDashboard /> : <Navigate to={getDashboard()} replace />}
      />

      <Route
        path="/agent"
        element={role === "agent" ? <AgentDashboard /> : <Navigate to={getDashboard()} replace />}
      />

      <Route path="*" element={<Navigate to={getDashboard()} replace />} />
    </Routes>
  );
}
