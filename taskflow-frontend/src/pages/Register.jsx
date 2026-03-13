import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Register = ()=>{
    const [name , setName] = useState("");
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();

        try{
            await API.post("/register",{
                name,
                email,
                password
            });

            alert("Registration Successfull");
            navigate("/login");
        }catch(error){
            alert(error.response?.data?.message || "Registration Failed");
        }
    }
    return(
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Enter Name" required 
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                />

                <br />

                <input type="email" placeholder="Enter Email" required value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <br />
                <input type="password" placeholder="Enter Password" required value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />
                <br />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Register;
