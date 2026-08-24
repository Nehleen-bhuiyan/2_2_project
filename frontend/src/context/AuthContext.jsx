// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Runs once when the app starts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("accessToken");

      // No token means user is not logged in
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/me");

        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);

        // Token may be invalid/expired
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Call this after successful login
  const login = (token, userData) => {
    localStorage.setItem("accessToken", token);
    setUser(userData);
  };

  // No backend logout needed with your current JWT setup
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};