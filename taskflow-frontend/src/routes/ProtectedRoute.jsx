import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoutes = ({children})=>{
    const {token} = useContext(AuthContext);

    if(!token){
       return <Navigate to="/login"/>;
    }

    return children;
}

export default ProtectedRoutes;