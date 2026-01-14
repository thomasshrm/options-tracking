import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "options_token";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);

  const saveToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem(STORAGE_KEY, newToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  const fetchMe = async (activeToken) => {
    if (!activeToken) return;
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    if (response.ok) {
      const data = await response.json();
      setUser(data);
    } else {
      logout();
    }
  };

  useEffect(() => {
    fetchMe(token);
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      saveToken,
      setUser,
      logout,
      apiUrl: API_URL,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
