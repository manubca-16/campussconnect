import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "college_admin" | "super_admin";
}

async function readJsonSafely(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text) return { data: null as any, raw: "" };

  if (contentType.includes("application/json")) {
    try {
      return { data: JSON.parse(text), raw: text };
    } catch {
      return { data: null as any, raw: text };
    }
  }

  // Try JSON anyway (some platforms mislabel content-type).
  try {
    return { data: JSON.parse(text), raw: text };
  } catch {
    return { data: null as any, raw: text };
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const { data, raw } = await readJsonSafely(res);
    if (res.ok) {
      if (!data?.user) throw new Error("Login failed: invalid server response.");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return data.user;
    } else {
      const message =
        data?.message ||
        (raw ? raw.slice(0, 200) : "") ||
        `Login failed (HTTP ${res.status}). Check VITE_API_BASE_URL and backend status.`;
      throw new Error(message);
    }
  };

  const register = async (formData: any) => {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const { data, raw } = await readJsonSafely(res);
    if (!res.ok) {
      const message =
        data?.message ||
        (raw ? raw.slice(0, 200) : "") ||
        `Registration failed (HTTP ${res.status}). Check VITE_API_BASE_URL and backend status.`;
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
