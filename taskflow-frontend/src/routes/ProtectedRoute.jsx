import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import LoadingScreen from "../components/common/LoadingScreen";

const ProtectedRoutes = ({ children }) => {
    const { token, isAuthReady } = useContext(AuthContext);

    if (!isAuthReady) {
        return <LoadingScreen />;
    }

    if (!token) {
       return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoutes;
