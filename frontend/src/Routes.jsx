import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/Signup";
import ConsumerDashboardPage from "./pages/ConsumerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function AppRoutes() {
  const { user } = useAuth();


  //RBAC
  const getDashboard = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    return "/dashboard"; // consumer
  };

  return (


    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
  path="/login"
  element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
/>

<Route
  path="/register"
  element={!user ? <SignupPage /> : <Navigate to="/dashboard" replace />}
/>

<Route
  path="/dashboard"
  element={user ? <ConsumerDashboardPage /> : <Navigate to="/login" replace />}
/>

<Route
  path="*"
  element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
/>

<Route
  path="/admin"
  element={!user ? <AdminDashboard/> : <Navigate to="/login" replace />}
/>

    </Routes>
  );
}
