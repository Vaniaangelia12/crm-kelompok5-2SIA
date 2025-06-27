import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));

  // Belum login
  if (!loggedUser) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada batasan role (allowedRoles) tapi role user tidak termasuk
  if (allowedRoles && !allowedRoles.includes(loggedUser.role)) {
    // Arahkan ke halaman sesuai role
    if (loggedUser.role === "user") return <Navigate to="/user" replace />;
    if (loggedUser.role === "admin") return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  // Jika lulus semua, tampilkan kontennya
  return children;
}