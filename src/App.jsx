import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Chat from "./pages/Chat.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Signup from "./pages/Signup.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

import { AuthProvider, useAuth } from "./state/AuthContext.jsx";

import "./styles/tailwind.css";
import "./App.css";

/**
 * Composant de garde de routes.
 * - Si `roles` est fourni (ex: ['admin']), on vérifie l’appartenance.
 * - Sinon, on exige seulement que l’utilisateur soit authentifié.
 */
function Protected({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  // Non connecté → redirection vers /login, en mémorisant la page demandée
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Rôle non autorisé → redirection vers l’accueil
  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Accès réservé aux utilisateurs connectés (peu importe le rôle) */}
          <Route
            path="/chat"
            element={
              <Protected>
                <Chat />
              </Protected>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/history" element={<HistoryPage />} />

          {/* Accès réservé aux admins */}
          <Route
            path="/admin"
            element={
              <Protected roles={["admin"]}>
                <AdminDashboard />
              </Protected>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
