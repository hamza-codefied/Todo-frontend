import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, LoginCredentials, RegisterCredentials } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedUser = authService.getUser();
    const token = authService.getToken();

    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // Clear any stale cache from previous user sessions before logging in
    queryClient.clear();
    const response = await authService.login(credentials);
    authService.setAuth(response.token, response.user);
    setUser(response.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    // Clear any stale cache from previous user sessions before registering
    queryClient.clear();
    const response = await authService.register(credentials);
    authService.setAuth(response.token, response.user);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Still clear local auth even if API call fails
    }
    // CRITICAL: Clear React Query cache to prevent data leakage between users
    // This removes all cached projects, tasks, and todos from the previous user
    queryClient.clear();
    authService.clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
