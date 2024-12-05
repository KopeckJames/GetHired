import { createContext, useContext, useState, useEffect } from "react";
import type { User, SerializedUser } from "~/types/user";
import { deserializeUser } from "~/types/user";
import { useRevalidator, useNavigate } from "@remix-run/react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isInitialized: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: SerializedUser | null;
  initialAuthState: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, initialUser, initialAuthState }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ? deserializeUser(initialUser) : null);
  const [isInitialized, setIsInitialized] = useState(true);
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          setUser(null);
          document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          navigate('/?error=' + encodeURIComponent(data.error || 'Authentication failed. Please sign in again.'));
          return;
        }

        if (data.user) {
          setUser(deserializeUser(data.user));
        }
      } catch (error) {
        console.error('Error verifying auth:', error);
        setUser(null);
        document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        navigate('/?error=' + encodeURIComponent('Authentication error. Please try again.'));
      }
    };

    // Only verify if we think we're authenticated
    if (initialAuthState) {
      verifyAuth();
    }
  }, [initialAuthState, navigate]);

  const value = {
    isAuthenticated: !!user,
    user,
    isInitialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
