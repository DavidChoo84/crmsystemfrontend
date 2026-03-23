import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
  const location = useLocation();
  const isProjectPage = location.pathname.startsWith("/project");

  // Header height (adjust if you change padding in Header)
  const headerHeight = 110; // px

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-30 bg-white shadow-sm">
        <Header />
      </div>

      <div className="flex flex-1 pt-[72px]">
        {/* Fixed Sidebar (only for project routes) */}
        {isProjectPage && (
          <aside
            className="fixed left-0 w-64 h-[calc(100vh-72px)] bg-white border-r border-gray-200 shadow-md overflow-y-auto z-20"
            style={{ top: `${headerHeight}px` }}
          >
            <Sidebar />
          </aside>
        )}

        {/* Scrollable Content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isProjectPage ? "ml-64" : ""
          } p-6`}
          style={{ height: `calc(100vh - ${headerHeight}px)` }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
