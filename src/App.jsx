import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Chat from "./pages/Chat.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import "./styles/tailwind.css";
import "./App.css";
import Signup from "./pages/Signup.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

function Protected({ children, role = "admin" }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route
            path="/admin"
            element={
              <Protected>
                <AdminDashboard />
              </Protected>

              // <AdminDashboard />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
