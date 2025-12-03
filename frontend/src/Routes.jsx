// src/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/Signup";
import ConsumerDashboardPage from "./pages/ConsumerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/HelpAgent";

export default function AppRoutes() {
  const { user } = useAuth();

  // normalise role
  const role = user?.role ? String(user.role).toLowerCase() : "pending";

  const getDashboard = () => {
    if (!user) return "/login";

    switch (role) {
      case "admin":
        return "/admin";

      case "consumer":
        return "/dashboard";

      case "helpdeskagent":
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
        element={
          !user || role === "pending" ? (
            <LoginPage />
          ) : (
            <Navigate to={getDashboard()} replace />
          )
        }
      />

    
      <Route
        path="/register"
        element={
          !user || role === "pending" ? (
            <SignupPage />
          ) : (
            <Navigate to={getDashboard()} replace />
          )
        }
      />

    
      <Route
        path="/dashboard"
        element={
          role === "consumer" ? (
            <ConsumerDashboardPage />
          ) : (
            <Navigate to={getDashboard()} replace />
          )
        }
      />

      
      <Route
        path="/admin"
        element={
          role === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to={getDashboard()} replace />
          )
        }
      />

    
      <Route
        path="/agent"
        element={
          ["helpdeskagent", "helpdesk", "agent"].includes(role) ? (
            <AgentDashboard />
          ) : (
            <Navigate to={getDashboard()} replace />
          )
        }
      />

      
      <Route path="*" element={<Navigate to={getDashboard()} replace />} />
    </Routes>
  );
}
