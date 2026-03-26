import React, { Suspense, lazy, useContext } from "react";
import { Navigate, Routes , Route } from "react-router-dom";
import LoadingScreen from "../components/common/LoadingScreen";
import ProtectedRoutes from "./ProtectedRoute";
import { AuthContext } from "../context/auth-context";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Landing = lazy(() => import("../pages/Landing"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Terms = lazy(() => import("../pages/Terms"));
const About = lazy(() => import("../pages/About"));
const GoogleCallback = lazy(() => import("../pages/GoogleCallback"));

const AppRoutes = ()=>{
    const { token } = useContext(AuthContext);

    return(
        <Suspense
            fallback={
                <LoadingScreen
                    message={token ? "Opening your workspace..." : "Loading TaskFlow..."}
                />
            }
        >
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
                <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
                <Route path="/dashboard"
                element={<ProtectedRoutes>
                    <Dashboard />
                </ProtectedRoutes>} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth/callback" element={<GoogleCallback />} />
                <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;
