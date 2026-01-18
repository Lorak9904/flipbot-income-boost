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

  // Helper: check if token is expired or about to expire (within 1 minute)
  const isTokenExpiredOrExpiring = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now() + 60000; // 1 min buffer
    } catch {
      return true; // Treat parse errors as expired
    }
  };

  // Helper: attempt silent refresh, returns new access token or null
  const attemptSilentRefresh = async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem("flipit_refresh_token");
    if (!storedRefreshToken) return null;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("flipit_token", data.token);
        console.log("✅ Token silently refreshed on startup");
        return data.token;
      }
    } catch (error) {
      console.error("Silent refresh failed:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchUser = async () => {
      let token = localStorage.getItem("flipit_token");
      
      // No token at all - user is logged out
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // If token is expired/expiring, try silent refresh FIRST
      if (isTokenExpiredOrExpiring(token)) {
        const newToken = await attemptSilentRefresh();
        if (newToken) {
          token = newToken;
        } else {
          // Refresh failed - clear tokens and logout
          console.log("⚠️ Token expired and refresh failed - logging out");
          localStorage.removeItem("flipit_token");
          localStorage.removeItem("flipit_user");
          localStorage.removeItem("flipit_refresh_token");
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      // Now fetch user with valid token
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
        } else if (response.status === 401) {
          // Token was valid but still got 401 - try refresh once more
          const newToken = await attemptSilentRefresh();
          if (newToken) {
            // Retry with new token
            const retryResponse = await fetch("/api/auth/user", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${newToken}`
              },
              body: JSON.stringify({ token: newToken }),
            });
            if (retryResponse.ok) {
              const userData = await retryResponse.json();
              setUser(userData);
              syncLanguageCookie(userData.language);
            } else {
              // Even after refresh, still failing - give up
              localStorage.removeItem("flipit_token");
              localStorage.removeItem("flipit_user");
              localStorage.removeItem("flipit_refresh_token");
              setUser(null);
            }
          } else {
            localStorage.removeItem("flipit_token");
            localStorage.removeItem("flipit_user");
            localStorage.removeItem("flipit_refresh_token");
            setUser(null);
          }
        } else {
          // Non-401 error (e.g., 500) - don't clear tokens immediately
          console.error("Failed to fetch user, status:", response.status);
          // Keep tokens, maybe server is temporarily down
          setUser(null);
        }
      } catch (error) {
        // Network error - don't clear tokens (might be transient)
        console.error("Failed to fetch user (network error):", error);
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
      // Backend returns: { userData: {...}, token, refresh_token }
      const userData = {
        id: data.userData?.id || data.id,
        name: data.userData?.name || data.name,
        email: data.userData?.email || data.email,
        provider,
        language: data.userData?.language
      };
      
      // Use setUserAndTokens to properly save both tokens
      setUserAndTokens(userData, data.token, data.refresh_token);
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
