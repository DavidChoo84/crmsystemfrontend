import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Project = () => {
  const navigate = useNavigate();
  const { projectName } = useParams(); // decoded to “Vital Care”
  const [project, setProject] = useState(null);

  // -------------------------
  // Fetch the project by exact name
  // -------------------------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/projects/name/${encodeURIComponent(projectName)}`
        );
        if (!res.ok) throw new Error("Project not found");

        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProject();
  }, [projectName]);

  const handleNavigate = (title) => {
    const path = title.toLowerCase().replace(" ", "-");
    navigate(`/project/${encodeURIComponent(projectName)}/${path}`);
  };

  if (!project) return <p className="p-6 text-gray-500">Loading project…</p>;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 capitalize">
          {projectName}
        </h2>
        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
          ACTIVE
        </span>
      </div>

      <p className="text-gray-500 mb-4">Quick Actions</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Product List", "Package List", "Assignation", "Target", "Reports"].map(
          (title) => (
            <div
              key={title}
              onClick={() => handleNavigate(title)}
              className="bg-gradient-to-r from-blue-600 to-orange-400 text-white p-4 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
            >
              <h3 className="text-lg font-semibold">{title}</h3>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(title);
                }}
                className="mt-2 bg-white text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Manage
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Project;
