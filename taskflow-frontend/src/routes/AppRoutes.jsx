import React, { useContext } from "react";
import { Navigate, Routes , Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoutes from "./ProtectedRoute";
import { AuthContext } from "../context/AuthContext";


const AppRoutes = ()=>{
    const { token } = useContext(AuthContext);

    return(
        <Routes>
            <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/dashboard"
             element={<ProtectedRoutes>
                <Dashboard />
             </ProtectedRoutes>} />
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
    );
}

export default AppRoutes;
