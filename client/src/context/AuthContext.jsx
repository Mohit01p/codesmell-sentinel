import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function login() {
    window.location.href = `${
      import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    }/auth/github`;
  }

  async function logout() {
    await axiosInstance.post("/auth/logout");
    setUser(null);
  }

  const value = { user, setUser, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}