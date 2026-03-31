import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, clearAuthToken, getAuthToken, setAuthToken, usersApi } from "../../lib/api";
import type { UserProfile } from "../../lib/types";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const response = await usersApi.getMe();
    setUser(response.data);
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      setAuthToken(response.data.accessToken);
      await refreshUser();
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!getAuthToken()) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    const handleSessionExpired = () => {
      logout();
      setIsLoading(false);
    };

    window.addEventListener("auth:expired", handleSessionExpired);
    restoreSession();

    return () => {
      window.removeEventListener("auth:expired", handleSessionExpired);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && getAuthToken()),
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
