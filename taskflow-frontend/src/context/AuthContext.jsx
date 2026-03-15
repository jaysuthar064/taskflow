import React, { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

const getStoredToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Unable to access localStorage for token", error);
    return null;
  }
};

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Unable to access localStorage for user", error);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);

  const login = (nextToken, nextUser) => {
    try {
      localStorage.setItem("token", nextToken);
      if (nextUser) localStorage.setItem("user", JSON.stringify(nextUser));
    } catch (error) {
      console.error("Unable to save credentials to localStorage", error);
    }
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Unable to remove credentials from localStorage", error);
    }
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (token && !user) {
        try {
          const response = await API.get("/profile");
          const userData = response.data?.user;
          if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
    };
    fetchProfile();
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
