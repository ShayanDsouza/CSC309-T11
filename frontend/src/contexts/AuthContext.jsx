import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // On hard reload, check if there's a token and fetch user
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch(`${BACKEND_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(data => {
                    setUser(data.user);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                    setUser(null);
                });
        }
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const error = await res.json();
                return error.message;
            }

            const { token } = await res.json();
            localStorage.setItem("token", token);

            // Get user data
            const userRes = await fetch(`${BACKEND_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const userData = await userRes.json();
            setUser(userData.user);

            navigate("/profile");
        } catch (err) {
            return "An error occurred. Please try again.";
        }
    };

    const register = async (userData) => {
        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            if (!res.ok) {
                const error = await res.json();
                return error.message;
            }

            navigate("/success");
        } catch (err) {
            return "An error occurred. Please try again.";
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
