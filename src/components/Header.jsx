import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "./TopNav";
import { Bell, LogOut } from "lucide-react"; // 🔑 Added LogOut icon

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "User" });

    useEffect(() => {
        // 🔑 Retrieve the logged-in user data from localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (err) {
                console.error("Failed to parse user data:", err);
            }
        }
    }, []);

    const handleSignOut = () => {
        // 🔑 Clear session details completely
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // 🚀 Redirect back to login portal
        navigate("/login", { replace: true });
    };

    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-2">
                <img src="/logo.png" alt="FoxTech" className="h-6"/>
                <span className="font-semibold text-gray-700 text-lg">FoxTech</span>
            </div>

            <TopNav/>

            <div className="flex items-center gap-4">
                <Bell className="text-gray-500 w-5 h-5 cursor-pointer" />
                
                {/* Dynamic User Profile Badge */}
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full gap-2">
                    <img src="/user.jpg" alt="User Avatar" className="w-6 h-6 rounded-full object-cover"/>
                    <span className="text-sm font-medium text-gray-700">
                        {user.name} {/* 👤 Replaced 'Derick Ang' with dynamic user name */}
                    </span>
                </div>

                {/* 🚪 Custom Designed Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-all duration-200"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </header>
    );
};

export default Header;