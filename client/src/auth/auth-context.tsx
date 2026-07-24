import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
  id: string;
  username: string;
  role: string;
  staffId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isAssistant: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitialToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("dentalsoft-token");
  }
  return null;
}

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.userId, username: payload.username, role: payload.role, staffId: payload.staffId };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const t = getInitialToken();
    if (t) {
      const decoded = decodeToken(t);
      if (decoded) {
        setToken(t);
        setUser(decoded);
      } else {
        localStorage.removeItem("dentalsoft-token");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("dentalsoft-token", token);
      setUser(decodeToken(token));
    } else {
      localStorage.removeItem("dentalsoft-token");
      setUser(null);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("dentalsoft-token", data.token);
    setToken(data.token);
    setUser(decodeToken(data.token));
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, isLoading,
      isAuthenticated: !!token,
      isAdmin: user?.role === "admin",
      isDoctor: user?.role === "doctor",
      isAssistant: user?.role === "assistant",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}