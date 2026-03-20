import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import API from "../api/axios";
import { getExistingPushSubscription, isPushSupported } from "../utils/pushNotifications";
import { clearPendingTwoFactorChallenge } from "../utils/twoFactorChallenge";

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

const clearStoredAuth = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Unable to remove credentials from localStorage", error);
  }

  clearPendingTwoFactorChallenge();
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Check if we have credentials on initial mount
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(storedUser);
    setIsAuthReady(true);
  }, []);

  const login = useCallback((nextToken, nextUser) => {
    try {
      localStorage.setItem("token", nextToken);
      if (nextUser) localStorage.setItem("user", JSON.stringify(nextUser));
    } catch (error) {
      console.error("Unable to save credentials to localStorage", error);
    }

    clearPendingTwoFactorChallenge();
    setToken(nextToken);
    setUser(nextUser);
    setIsAuthReady(true);
  }, []);

  const forceLocalLogout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setIsAuthReady(true);
  }, []);

  const logout = useCallback(async ({
    skipServer = false,
    skipPushCleanup = false
  } = {}) => {
    if (!skipPushCleanup && isPushSupported()) {
      try {
        const subscription = await getExistingPushSubscription();

        if (subscription?.endpoint) {
          await API.delete("/push/subscriptions", {
            data: {
              endpoint: subscription.endpoint,
            },
          });
        }
      } catch (error) {
        console.error("Unable to detach push subscription during logout", error);
      }
    }

    if (!skipServer && getStoredToken()) {
      try {
        await API.post("/logout");
      } catch (error) {
        console.error("Unable to revoke current session during logout", error);
      }
    }

    forceLocalLogout();
  }, [forceLocalLogout]);

  useEffect(() => {
    const handleAuthExpired = () => {
      forceLocalLogout();
    };

    window.addEventListener("taskflow:auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("taskflow:auth-expired", handleAuthExpired);
    };
  }, [forceLocalLogout]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token && !user) {
        try {
          const response = await API.get("/profile");
          const userData = response.data?.user;
          if (userData) {
            try {
              localStorage.setItem("user", JSON.stringify(userData));
            } catch (storageError) {
              console.error("Unable to cache user profile", storageError);
            }
            setUser(userData);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          if (error.response?.status === 401) {
            forceLocalLogout();
          }
        }
      }
    };
    fetchProfile();
  }, [token, user, forceLocalLogout]);

  const value = useMemo(() => ({
    token,
    user,
    login,
    logout,
    forceLocalLogout,
    isAuthReady
  }), [token, user, login, logout, forceLocalLogout, isAuthReady]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
