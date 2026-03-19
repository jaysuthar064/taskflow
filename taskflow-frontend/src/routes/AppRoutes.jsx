import React, { useContext } from "react";
import { Navigate, Routes , Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Landing from "../pages/Landing";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import About from "../pages/About";
import GoogleCallback from "../pages/GoogleCallback";
import ProtectedRoutes from "./ProtectedRoute";
import { AuthContext } from "../context/AuthContext";
import { useAppInstallPrompt } from "../hooks/useAppInstallPrompt";


const AppRoutes = ()=>{
    const { token } = useContext(AuthContext);
    const installSettings = useAppInstallPrompt();

    return(
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/dashboard"
             element={<ProtectedRoutes>
                <Dashboard installSettings={installSettings} />
             </ProtectedRoutes>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
    );
}

export default AppRoutes;
