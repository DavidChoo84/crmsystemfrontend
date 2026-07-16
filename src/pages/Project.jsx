import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFolderOpen, faBox, faLayerGroup, faUserGear, 
  faBullseye, faChartLine, faChevronRight, faHashtag, 
  faPlus, faPen, faTrash, faExclamationTriangle, faTimes,
  faFolder 
} from "@fortawesome/free-solid-svg-icons";
import ProjectEditModal from "../components/ProjectEditModal";

const Project = () => {
  const navigate = useNavigate();
  const { projectName } = useParams();
  
  const [projectData, setProjectData] = useState(null);
  const [allProjects, setAllProjects] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (projectName) {
      fetchProjectDetails();
    } else {
      fetchAllProjects(); 
    }
  }, [projectName]);

  // --- API GET REQUESTS (WITH HEADERS) ---
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // 🚀 Get the token
      const res = await fetch(`http://localhost:3000/projects/name/${encodeURIComponent(projectName)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🚀 Pass token to authorization header
        }
      });
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setProjectData(data);
    } catch (err) {
      console.error("Project not found", err);
      setProjectData(null);
      fetchAllProjects(); 
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // 🚀 Get the token
      const res = await fetch("http://localhost:3000/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🚀 Pass token to authorization header
        }
      });
      const data = await res.json();
      setAllProjects(data);
      
      if (!projectName && data.length > 0) {
        navigate(`/project/${encodeURIComponent(data[0].projectName)}`);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  // --- API MUTATION HANDLERS (WITH HEADERS) ---
  const handleSaveNewProject = async (formData) => {
    try {
      const token = localStorage.getItem("token"); // 🚀 Get the token
      const res = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🚀 Pass token to authorization header
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) window.location.href = `/project/${encodeURIComponent(formData.projectName)}`;
    } catch (err) {
      console.error("Creation failed", err);
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      const token = localStorage.getItem("token"); // 🚀 Get the token
      const res = await fetch(`http://localhost:3000/projects/${projectData.projectId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🚀 Pass token to authorization header
        },
        body: JSON.stringify({ projectName: formData.projectName }),
      });

      if (res.ok) {
        setModalMode(null);
        if (formData.projectName !== projectName) {
          navigate(`/project/${encodeURIComponent(formData.projectName)}`);
        } else {
          fetchProjectDetails();
        }
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token"); // 🚀 Get the token
      const res = await fetch(`http://localhost:3000/projects/${projectData.projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🚀 Pass token to authorization header
        }
      });
      if (res.ok) {
        setModalMode(null);
        window.location.href = "/project";
      }
    } catch (err) {
      console.error("Delete failed", err);
      setIsDeleting(false);
    }
  };

  const modules = [
    { title: "Product List", path: "product-list", icon: faBox, color: "text-blue-500", bg: "bg-blue-50", desc: "Manage inventory" },
    { title: "Package List", path: "package-list", icon: faLayerGroup, color: "text-indigo-500", bg: "bg-indigo-50", desc: "Bundle products" },
    { title: "Member Assignment", path: "members", icon: faUserGear, color: "text-purple-500", bg: "bg-purple-50", desc: "Staff & Teams" },
    { title: "Project Target", path: "target", icon: faBullseye, color: "text-rose-500", bg: "bg-rose-50", desc: "KPI tracking" },
    { title: "Reports", path: "reports", icon: faChartLine, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Analytics" },
  ];

  if (loading) return <div className="p-10 text-gray-400 animate-pulse font-medium text-center">Loading...</div>;

  // --- RENDER EMPTY STATE ---
  if (!projectName && allProjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-[#F8F9FA]">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-50 max-w-lg w-full text-center space-y-8">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-200 text-4xl">
            <FontAwesomeIcon icon={faFolder} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900">Welcome to CRM</h2>
            <p className="text-gray-400 text-sm leading-relaxed px-10">
              You don't have any projects yet. Create your first project workspace to start.
            </p>
          </div>
          <button 
            onClick={() => setModalMode('create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 mx-auto transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create First Project
          </button>
          
          {(modalMode === 'create') && (
            <ProjectEditModal 
              project={{ isNew: true, projectName: "" }} 
              onClose={() => setModalMode(null)} 
              onSave={handleSaveNewProject} 
            />
          )}
        </div>
      </div>
    );
  }

  if (!projectData) return <div className="p-10 text-red-500 font-bold text-center">Project "{projectName}" not found.</div>;

  // --- RENDER PROJECT VIEW ---
  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600 text-2xl">
            <FontAwesomeIcon icon={faFolderOpen} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-gray-900 capitalize">{projectName}</h2>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Active</span>
              
              <div className="flex gap-2 ml-2">
                <button onClick={() => setModalMode('edit')} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center text-xs">
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button onClick={() => setModalMode('delete')} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center text-xs">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1 font-mono">
              <FontAwesomeIcon icon={faHashtag} className="text-[10px]" />
              {projectData.projectId}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setModalMode('create')}
          className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} className="text-indigo-600" />
          Add Project
        </button>
      </div>

      {/* MODULE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {modules.map((m) => (
          <button
            key={m.title}
            onClick={() => navigate(`/project/${encodeURIComponent(projectName)}/${m.path}`)}
            className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left flex flex-col"
          >
            <div className={`w-14 h-14 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
              <FontAwesomeIcon icon={m.icon} />
            </div>
            <h4 className="text-gray-900 font-black text-lg mb-1">{m.title}</h4>
            <p className="text-gray-400 text-xs leading-relaxed flex-1">{m.desc}</p>
            <div className="mt-8 flex items-center justify-between text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
              <span>Open Module</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </button>
        ))}
      </div>

      {/* MODALS */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <ProjectEditModal 
          project={modalMode === 'create' ? { isNew: true, projectName: "" } : { ...projectData, isNew: false }} 
          onClose={() => setModalMode(null)} 
          onSave={modalMode === 'create' ? handleSaveNewProject : handleUpdateProject} 
        />
      )}

      {modalMode === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden transform transition-all">
            <div className="flex justify-between items-center bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Delete Project
              </h3>
              <button onClick={() => setModalMode(null)} className="text-red-200 hover:text-white transition-colors p-2">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
            <div className="p-8 space-y-6 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 text-3xl mb-2">
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <h4 className="text-2xl font-black text-gray-900">Are you absolutely sure?</h4>
              <p className="text-gray-500 leading-relaxed">
                You are about to permanently delete <strong className="text-gray-900">{projectData.projectName}</strong>. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-8 py-6 bg-gray-50 border-t">
              <button onClick={() => setModalMode(null)} className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleDeleteProject} disabled={isDeleting} className="px-10 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 transition-all">
                {isDeleting ? "Deleting..." : "Yes, Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;