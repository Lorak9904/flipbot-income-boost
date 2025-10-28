import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleLogout } from '@react-oauth/google'; // <-- Add this import

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'email';
  language?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
  login: (userData: User, token: string) => void;
  loginWithProvider: (provider: 'google' | 'facebook', token: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUserAndTokens: (userData: User, token: string, refreshToken: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to sync language cookie from user data
const syncLanguageCookie = (language?: string) => {
  if (language && (language === 'en' || language === 'pl')) {
    document.cookie = `lang=${language}; path=/; max-age=31536000`; // 1 year
    console.log(`✅ Language cookie synced: ${language}`);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const setUserAndTokens = (userData: User, token: string, refreshToken: string) => {
  setUser(userData);
  localStorage.setItem("flipit_user", JSON.stringify(userData));
  localStorage.setItem("flipit_token", token);
  localStorage.setItem("flipit_refresh_token", refreshToken);
  
  // Sync language cookie from user's saved preference
  syncLanguageCookie(userData.language);
};

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("flipit_refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");
    
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("flipit_token", data.token);
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      logout();
      throw error;
    }
  };

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = localStorage.getItem("flipit_token");
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now() + 300000) { // 5 min before expiration
          await refreshToken();
        }
      } catch (error) {
        console.error("Token check failed:", error);
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("flipit_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/user", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Sync language cookie from user's saved preference
          syncLanguageCookie(userData.language);
        } else {
          localStorage.removeItem("flipit_token");
          localStorage.removeItem("flipit_user");
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("flipit_token");
        localStorage.removeItem("flipit_user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('flipit_user', JSON.stringify(userData));
    localStorage.setItem('flipit_token', token);
  };

  const loginWithProvider = async (provider: 'google' | 'facebook', token: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, token }),
      });

      if (!response.ok) {
        throw new Error("Failed to log in");
      }

      const data = await response.json();
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        provider
      };
      
      const authToken = data.token;
      setUser(userData);
      localStorage.setItem("flipit_user", JSON.stringify(userData));
      localStorage.setItem("flipit_token", authToken);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();
      const userData = {
        id: data.userData.id,
        name: data.userData.name || email.split('@')[0],
        email: data.userData.email,
        provider: 'email' as const,
        language: data.userData.language
      };
      
      const authToken = data.token;
      setUser(userData);
      localStorage.setItem("flipit_user", JSON.stringify(userData));
      localStorage.setItem("flipit_token", authToken);
      localStorage.setItem("flipit_refresh_token", data.refresh_token);
      
      // Sync language cookie from user's saved preference
      syncLanguageCookie(userData.language);
    } catch (error) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      // Do NOT set user or token after registration
      // User must log in after registering
      return await response.json();
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    if (user?.provider === 'google') {
      googleLogout(); // <-- Google logout
    }
    setUser(null);
    localStorage.removeItem("flipit_user");
    localStorage.removeItem("flipit_token");
    localStorage.removeItem("flipit_refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refreshToken,
        login,
        loginWithProvider,
        loginWithEmail,
        registerWithEmail,
        logout,
        setUserAndTokens, // ← Add this
      }}
    >
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
