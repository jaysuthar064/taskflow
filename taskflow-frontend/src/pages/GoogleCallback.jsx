import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { savePendingTwoFactorChallenge } from "../utils/twoFactorChallenge";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const challengeToken = params.get("challengeToken");
    const userDataStr = params.get("user");

    if (!userDataStr) {
      navigate("/login?error=no_token", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userDataStr));

      if (token) {
        login(token, user);
        navigate("/dashboard", { replace: true });
        return;
      }

      if (challengeToken) {
        savePendingTwoFactorChallenge({
          challengeToken,
          user
        });
        navigate("/login?twoFactor=required", { replace: true });
        return;
      }

      navigate("/login?error=no_token", { replace: true });
    } catch (error) {
      console.error("Error completing Google authentication:", error);
      navigate("/login?error=auth_failed", { replace: true });
    }
  }, [location.search, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-surface-600 font-medium">Completing secure login...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
