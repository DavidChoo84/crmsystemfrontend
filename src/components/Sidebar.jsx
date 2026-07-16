import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    // 1. Grab the token you saved during login
    const token = localStorage.getItem("token"); 

    fetch("http://localhost:3000/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 🚀 Pass the token securely in the Authorization header
        "Authorization": `Bearer ${token}` 
      }
    })
      .then((res) => {
        // 2. Safety check: If backend rejects it, don't let it pass to the next .then()
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // 3. Ensure data is actually an array before spreading/sorting
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) =>
            a.projectId.localeCompare(b.projectId)
          );
          setProjects(sorted);
        } else {
          console.error("Expected an array of projects, but received:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentProject = decodeURIComponent(pathParts[1] || "");
  const activePage =
    pathParts[2]?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";

  useEffect(() => {
    if (currentProject) setExpandedProject(currentProject);
  }, [currentProject]);

  const subPages = ["Product List", "Package List", "Assignation", "Target", "Reports"];

  const toggleExpand = (projectName) => {
    setExpandedProject((prev) => (prev === projectName ? null : projectName));
  };

  return (
    <div className="w-64 bg-white shadow-md p-4 min-h-screen border-r border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 tracking-tight">Projects</h3>

      <ul className="space-y-2">
        {projects.map((project) => {
          const isActiveProject =
            currentProject.toLowerCase() === project.projectName.toLowerCase();
          const isExpanded = expandedProject === project.projectName;

          return (
            <li key={project.projectId}>
              {/* Project Header */}
              <div
                onClick={() => {
                  toggleExpand(project.projectName);
                  navigate(`/project/${encodeURIComponent(project.projectName)}`);
                }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActiveProject
                    ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span>{project.projectName}</span>
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-gray-400 text-sm"
                >
                  ▶
                </motion.span>
              </div>

              {/* Subpages */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="ml-4 mt-2 space-y-1 overflow-hidden"
                  >
                    {subPages.map((page) => {
                      const pagePath = page.toLowerCase().replace(" ", "-");
                      const isActivePage =
                        activePage.toLowerCase() === page.toLowerCase();

                      return (
                        <li
                          key={page}
                          onClick={() =>
                            navigate(
                              `/project/${encodeURIComponent(
                                project.projectName
                              )}/${pagePath}`
                            )
                          }
                          className="relative p-2 rounded-md cursor-pointer overflow-hidden transition-all duration-200"
                        >
                          {/* 🟦 Smooth animated background pill */}
                          {isActivePage && (
                            <motion.div
                              layoutId="active-pill-sidebar"
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                              transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                                mass: 0.4,
                                duration: 0.4,
                              }}
                            />
                          )}

                          <motion.span
                            className={`relative z-10 text-sm font-medium ${
                              isActivePage
                                ? "text-white"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                            layout
                            transition={{ duration: 0.3 }}
                          >
                            {page}
                          </motion.span>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
