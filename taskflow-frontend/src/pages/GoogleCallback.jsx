import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const userDataStr = params.get("user");

        if (token && userDataStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userDataStr));
                login(token, user);
                // Slight delay to ensure context update propagates
                setTimeout(() => {
                    navigate("/dashboard", { replace: true });
                }, 100);
            } catch (error) {
                console.error("Error parsing user data:", error);
                navigate("/login?error=auth_failed");
            }
        } else {
            navigate("/login?error=no_token");
        }
    }, [location, login, navigate]);

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
