import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Erreur de chargement de l'utilisateur:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur de connexion",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post("/api/auth/register", userData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur d'inscription",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
