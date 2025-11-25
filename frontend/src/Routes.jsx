import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/Signup";
import ConsumerDashboardPage from "./pages/ConsumerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function AppRoutes() {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "admin":
        return "/admin";

      case "consumer":
        return "/dashboard";
      case "pending":
      default:
        return "/login";
    }
  };

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={
          !user || user.role === "pending"
            ? <LoginPage />
            : <Navigate to={getDashboard()} replace />
        }
      />

      <Route
        path="/register"
        element={
          !user || user.role === "pending"
            ? <SignupPage />
            : <Navigate to={getDashboard()} replace />
        }
      />

      {/* CONSUMER DASHBOARD (consumer only) */}
      <Route
        path="/dashboard"
        element={
          user?.role === "consumer"
            ? <ConsumerDashboardPage />
            : <Navigate to={getDashboard()} replace />
        }
      />

      {/* ADMIN DASHBOARD (admin only) */}
      <Route
        path="/admin"
        element={
          user?.role === "admin"
            ? <AdminDashboard />
            : <Navigate to={getDashboard()} replace />
        }
      />

      {/* CATCH-ALL */}
      <Route
        path="*"
        element={<Navigate to={getDashboard()} replace />}
      />
    </Routes>
  );
}
