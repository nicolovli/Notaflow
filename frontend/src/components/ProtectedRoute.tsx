import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../firebase/func/useAuth";

export const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};
