import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Login = ()=>{
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const {login} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();

        try{
            const response = await API.post("/login",{
                email,
                password
            });

            const token = response.data.token;
            login(token);
            navigate("/dashboard")
        }catch(error){
            alert(error.response?.data?.message || "Login Failed");
        }
    }
    return(
        <div >
            <h2>Login Form</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email"
                    placeholder="Enter Email"
                    required
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <br />

                <input 
                    type="password"
                    placeholder="Enter password"
                    required
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <br />

                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login;
