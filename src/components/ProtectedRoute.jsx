import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const loggedUser = sessionStorage.getItem("loggedUser");

  // Jika belum login, redirect ke /login
  if (!loggedUser) {
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, tampilkan children (halaman yang diminta)
  return children;
}