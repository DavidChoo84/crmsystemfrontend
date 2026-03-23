import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Project", path: "/project" },
  { name: "Member Assignment", path: "/members" },
  { name: "Order", path: "/orders" },
  { name: "Customer", path: "/customers" },
];

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="relative flex items-center justify-center gap-6 bg-[#f4f6fa] rounded-full py-2 px-6 mx-auto mt-6 w-fit shadow-sm">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`);

        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className="relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
          >
            {/* 🟩 Animated white pill background */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white shadow-md rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>

            {/* 🟦 Button label */}
            <span
              className={`relative z-10 ${
                isActive
                  ? "text-gray-900 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default TopNav;
