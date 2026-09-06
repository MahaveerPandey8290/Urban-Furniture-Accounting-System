import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login: call backend, store tokens, set user in state
  const login = useCallback(async (loginId, password) => {
    const response = await api.post("/auth/login", { loginId, password });
    const { accessToken, refreshToken } = response.data;

    // Decode user payload from accessToken JWT (backend returns no user object, only tokens)
    let userData = response.data.user;
    if (!userData && accessToken) {
      try {
        const base64Url = accessToken.split(".")[1];
        // Add padding required by atob() — JWT base64url strips padding chars
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "===".slice(0, (4 - (base64.length % 4)) % 4);
        const jsonPayload = decodeURIComponent(
          atob(padded)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        userData = {
          id: decoded.sub,
          loginId: decoded.loginId,
          role: decoded.role,
          contactId: decoded.contactId ?? null,
          companyId: decoded.companyId,
          mustChangePassword: decoded.mustChangePassword ?? false,
        };
      } catch (e) {
        console.error("Failed to decode JWT:", e);
        throw new Error("Authentication error: could not decode session token.");
      }
    }

    if (!userData) {
      throw new Error("Authentication error: no user data received.");
    }

    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    return userData;
  }, []);

  // Logout: call backend to invalidate refresh token, clear storage
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Proceed with local logout even if API call fails
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
