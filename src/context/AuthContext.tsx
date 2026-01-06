import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import { authService } from '../services/authService';

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
    const response = await authService.login(credentials);
    authService.setAuth(response.token, response.user);
    setUser(response.user);
  };

  const register = async (credentials: RegisterCredentials) => {
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
