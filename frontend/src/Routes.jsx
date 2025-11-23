import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/Signup";
import ConsumerDashboardPage from "./pages/ConsumerDashboard";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/register"
        element={!user ? <SignupPage /> : <Navigate to="/dashboard" />}
      />

      {/* PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={user ? <ConsumerDashboardPage /> : <Navigate to="/login" />}
      />

      {/* CATCH ALL */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}
