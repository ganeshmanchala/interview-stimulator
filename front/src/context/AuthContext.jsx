// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Load user from localStorage on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("app_token");
        const userData = localStorage.getItem("user") || localStorage.getItem("app_user");
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        // Clear corrupted auth data
        localStorage.removeItem("token");
        localStorage.removeItem("app_token");
        localStorage.removeItem("user");
        localStorage.removeItem("app_user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    // Store in all possible keys for consistency
    localStorage.setItem("token", token);
    localStorage.setItem("app_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("app_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("app_token");
    localStorage.removeItem("user");
    localStorage.removeItem("app_user");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      isAuthenticated,
      loading // Export loading state
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);