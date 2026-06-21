import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Dashboard", path: "/dashboard", allowedRoles: ["master", "logistic", "cs_pc"] },
  { name: "Project", path: "/project", allowedRoles: ["master", "cs_pc"] },
  { name: "Member Assignment", path: "/members", allowedRoles: ["master"] },
  { name: "Order", path: "/orders", allowedRoles: ["master", "cs_pc"] },
  { name: "Customer", path: "/customers", allowedRoles: ["master", "cs_pc"] },
  { name: "Logistic", path: "/logistic", allowedRoles: ["master", "logistic"] },
];

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const localUserData = localStorage.getItem("user");
  const user = localUserData ? JSON.parse(localUserData) : null;
  const userRole = user?.role || ""; 

  const visibleNavItems = navItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <nav className="relative flex items-center justify-center gap-6 bg-[#f4f6fa] rounded-full py-2 px-6 mx-auto mt-6 w-fit shadow-sm">
      {visibleNavItems.map((item) => {
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