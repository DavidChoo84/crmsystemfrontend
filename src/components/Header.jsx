import React from "react";
import TopNav from "./TopNav";
import { Bell } from "lucide-react";

const Header = () => {
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-2">
                <img src="/logo.png" alt="FoxTech" className="h-6"/>
                <span className="font-semibold text-gray-700 text-lg">FoxTech</span>
            </div>

        <TopNav/>

        <div className="flex items-center gap-4">
            <Bell className="text-gray-500 w-5 h-5 cursor-pointer" />
            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full gap-2">
                <img src="/user.jpg" alt="User Avatar" className="w-6 h-6 rounded-full object-cover"/>
                <span className="text-sm font-medium text-gray-700">Derick Ang</span>
            </div>
        </div>
        </header>
    );
};

export default Header;