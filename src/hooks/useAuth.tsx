import { useState, useEffect, createContext, useContext } from "react";
import { api } from "@/lib/api";

type AuthUser = { id: string; email: string; role: string; created_at: string };

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  isAdmin: boolean;
  isLoading: boolean;
  setSession: (token: string, userData: AuthUser) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  setSession: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSessionState] = useState<{ access_token: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Expose this method so Login/Setup components can update the context
  const setSession = (token: string, userData: AuthUser) => {
    localStorage.setItem("auth_token", token);
    setSessionState({ access_token: token });
    setUser(userData);
    setIsAdmin(userData.role === "admin");
    setIsLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setSessionState(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) throw new Error("No token");

        const { user: userData } = await api.get("/auth/me");
        if (userData) {
          setSessionState({ access_token: token });
          setUser(userData);
          setIsAdmin(userData.role === "admin");
        } else {
          throw new Error("Invalid user");
        }
      } catch (err) {
        // Token is invalid, expired, or doesn't exist
        localStorage.removeItem("auth_token");
        setUser(null);
        setSessionState(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, setSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
