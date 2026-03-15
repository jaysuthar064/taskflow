import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await API.post("/login", { email, password });
            login(response.data.token, response.data.user);
            navigate("/dashboard");
        } catch (error) {
            alert(error.response?.data?.message || "Login Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 sm:p-6">
            <div className="w-full max-w-md">
                <div className="mb-8 sm:mb-10 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-sm sm:text-base text-surface-500">Access your workspace</p>
                </div>
                
                <div className="card glass p-5 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-surface-700 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-surface-700">Password</label>
                                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 mt-2 flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-surface-500">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
                
                <p className="mt-10 text-center text-xs text-surface-400">
                    &copy; 2026 TaskFlow Pro. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
