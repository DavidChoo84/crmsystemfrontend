import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faPlus } from "@fortawesome/free-solid-svg-icons"; // Use faFolder for the welcome screen
import ProjectEditModal from "./ProjectEditModal";

const ProjectRedirect = () => {
  // fetchProjects is passed from the Parent/Layout context to force a refresh
  const { projects, loading, fetchProjects } = useOutletContext();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // REDIRECT LOGIC: 
    // Only redirect if projects actually exist. 
    // If projects.length is 0, this useEffect does nothing, allowing the Welcome UI to show.
    if (!loading && projects && projects.length > 0) {
      navigate(`/project/${encodeURIComponent(projects[0].projectName)}`, { replace: true });
    }
  }, [projects, loading, navigate]);

  const handleSaveProject = async (formData) => {
    try {
      const res = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        
        // If your parent component handles the project list, refresh it here
        if (fetchProjects) await fetchProjects();

        // Navigate to the new project
        navigate(`/project/${encodeURIComponent(formData.projectName)}`);
      }
    } catch (err) {
      console.error("Error creating first project", err);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-gray-400 font-medium animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          Initializing workspace...
        </div>
      </div>
    );
  }

  // --- WELCOME UI (Shows only if projects.length === 0) ---
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#F8F9FA] p-12">
      <div className="max-w-md w-full text-center bg-white p-12 rounded-[3rem] shadow-sm border border-gray-50 space-y-8">
        
        {/* Large Folder Icon */}
        <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-200 text-4xl mx-auto">
          <FontAwesomeIcon icon={faFolder} />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-gray-900">Welcome to CRM</h2>
          <p className="text-gray-400 text-sm leading-relaxed px-6">
            You don't have any projects yet. Create your first project workspace to start.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create First Project
        </button>
      </div>

      {isModalOpen && (
        <ProjectEditModal 
          project={{ isNew: true, projectName: "" }} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveProject} 
        />
      )}
    </div>
  );
};

export default ProjectRedirect;