import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  // Header height (adjust if you change padding in Header)
  const headerHeight = 110; // px

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:3000/projects");
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Layout fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [location.pathname]); // Re-sync when user navigates

  const isProjectRoute = location.pathname.startsWith("/project");
  
  /**
   * CRITICAL LOGIC: 
   * Show sidebar ONLY if we are on a project page AND projects exist.
   * If projects are empty, the sidebar stays hidden so the "Empty State" card can take center stage.
   */
  const showSidebar = isProjectRoute && projects.length > 0;

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      {/* Fixed Header */}
      <div 
        className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-100"
        style={{ height: `${headerHeight}px` }}
      >
        <Header />
      </div>

      <div className="flex flex-1" style={{ paddingTop: `${headerHeight}px` }}>
        {/* Fixed Sidebar */}
        {showSidebar && (
          <aside
            className="fixed left-0 w-64 bg-white border-r border-gray-100 overflow-y-auto z-30"
            style={{ 
              top: `${headerHeight}px`, 
              height: `calc(100vh - ${headerHeight}px)` 
            }}
          >
            {/* Pass projects to Sidebar so it doesn't have to fetch again */}
            <Sidebar projects={projects} />
          </aside>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            showSidebar ? "ml-64" : "ml-0"
          }`}
        >
          <div className="h-full">
            {/* Pass projects down to child components (like ProjectRedirect) via Context */}
            <Outlet context={{ projects }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
