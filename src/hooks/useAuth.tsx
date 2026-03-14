import { useState, useEffect, createContext, useContext } from "react";
import { api } from "@/lib/api";

type AuthUser = { id: string; name?: string; phone?: string; role: string; created_at: string };

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  isAdmin: boolean;
  isLoading: boolean;
  setSession: (userData: AuthUser) => void;
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

  const setSession = (userData: AuthUser) => {
    setSessionState({ access_token: "cookie-session" });
    setUser(userData);
    setIsAdmin(userData.role === "admin");
    setIsLoading(false);
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setSessionState(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user: userData } = await api.get("/auth/me");
        if (userData) {
          setSessionState({ access_token: "cookie-session" });
          setUser(userData);
          setIsAdmin(userData.role === "admin");
        } else {
          throw new Error("Invalid user");
        }
      } catch (err) {
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
