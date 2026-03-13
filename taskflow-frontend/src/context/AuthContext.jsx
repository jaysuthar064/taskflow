import React, { createContext, useState } from "react";

export const AuthContext = createContext();

const getStoredToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Unable to access localStorage for token", error);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);

  const login = (nextToken) => {
    try {
      localStorage.setItem("token", nextToken);
    } catch (error) {
      console.error("Unable to save token to localStorage", error);
    }
    setToken(nextToken);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Unable to remove token from localStorage", error);
    }
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
