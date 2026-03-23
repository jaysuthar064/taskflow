import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { clearPendingTwoFactorChallenge } from "../utils/twoFactorChallenge";
import Seo from "../components/common/Seo";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userDataStr = params.get("user");

    clearPendingTwoFactorChallenge();

    if (!token || !userDataStr) {
      navigate("/login?error=no_token", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userDataStr));
      login(token, user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error completing Google authentication:", error);
      navigate("/login?error=auth_failed", { replace: true });
    }
  }, [location.search, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <Seo
        title="Completing Sign In | TaskFlow"
        description="Completing your TaskFlow sign-in."
        path="/auth/callback"
        robots="noindex,nofollow"
      />
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-surface-600 font-medium">Completing secure login...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
