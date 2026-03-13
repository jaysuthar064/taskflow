import { Routes , Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoutes from "./ProtectedRoute";


const AppRoutes = ()=>{
    return(
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard"
             element={<ProtectedRoutes>
                <Dashboard />
             </ProtectedRoutes>} />
        </Routes>
    );
}

export default AppRoutes;