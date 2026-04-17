
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { login as loginUser, logout as logoutUser, register as registerUser, rehydrateSession, type AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const session = await rehydrateSession();

        if (!isMounted) {
          return;
        }

        if (session) {
          setUser(session.user);
          setToken(session.token);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (bootstrapError) {
        console.error('Error restoring auth session:', bootstrapError);

        if (isMounted) {
          setError(bootstrapError instanceof Error ? bootstrapError.message : 'Unable to restore auth session.');
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      const result = await loginUser(credentials);
      setUser(result.user);
      setToken(result.token);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Unable to sign in.';
      setError(message);
      throw authError;
    }
  };

  const register = async (credentials: { name: string; email: string; password: string }) => {
    try {
      setError(null);
      const result = await registerUser(credentials);
      setUser(result.user);
      setToken(result.token);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Unable to create account.';
      setError(message);
      throw authError;
    }
  };

  const logout = () => {
    setError(null);
    setToken(null);
    setUser(null);
    logoutUser();
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
