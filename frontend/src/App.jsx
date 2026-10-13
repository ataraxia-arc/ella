import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, Protected } from "./auth";
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import HomePage from "./pages/Home";
import ProductsPage from "./pages/Products";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/products" element={<Protected><ProductsPage /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
