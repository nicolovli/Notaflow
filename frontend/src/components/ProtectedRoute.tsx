import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../firebase/func/useAuth";

/**
 * Blocks access to private pages unless logged in.
 * <Route element ={<ProtectedRoute />}>
 */

export const ProtectedRoute = () => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};