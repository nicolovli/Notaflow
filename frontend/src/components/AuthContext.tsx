import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../Config/firebase-config";

/**
 * Manages authentication state and provides user info
 * Is in main.tsx
 */

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
        const[user, setUser] = useState<User | null>(null);
        
        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user);
            });
            return () => unsubscribe();
        }, []);
    return(
        <AuthContext.Provider value={{ user, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;