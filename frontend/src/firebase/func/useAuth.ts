import { useContext } from "react";
import AuthContext from "../../components/AuthContext";

/**
 * A helper function to easily access the authentication state. 
 * ex: 
 *  check if a user is logged in -> const { isLoggedIn, user } = useAuth();
 */

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};