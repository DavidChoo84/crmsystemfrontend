import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSave, faFolderPlus, faHashtag, faFileSignature } from "@fortawesome/free-solid-svg-icons";

const ProjectEditModal = ({ project, onClose, onSave }) => {
  const [loadingId, setLoadingId] = useState(false);
  const [formData, setFormData] = useState({
    projectId: project?.projectId || "",
    projectName: project?.projectName || "",
  });

  // --- 1. SYNC STATE WITH PROPS ---
  // This ensures that if the 'project' prop changes, the form updates
  useEffect(() => {
    setFormData({
      projectId: project?.projectId || "",
      projectName: project?.projectName || "",
    });

    if (project?.isNew) {
      fetchNextId();
    }
  }, [project]);

  const fetchNextId = async () => {
    setLoadingId(true);
    try {
      const res = await axios.get("http://localhost:3000/projects/next-id");
      setFormData(prev => ({ ...prev, projectId: res.data.nextId }));
    } catch (err) {
      console.error("Error fetching next project ID", err);
      // Optional: Set a temporary error ID so the user knows something is wrong
      setFormData(prev => ({ ...prev, projectId: "ERROR-RETRY" }));
    } finally {
      setLoadingId(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) return alert("Project Name is required");
    if (formData.projectId === "ERROR-RETRY" || !formData.projectId) {
        return alert("Cannot save without a valid Project ID. Please check your connection.");
    }
    onSave(formData);
  };

  // Styles
  const inputStyle = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm";
  const readOnlyStyle = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono text-gray-500 cursor-not-allowed";
  const labelStyle = "block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-700 to-indigo-600 px-8 py-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <FontAwesomeIcon icon={project.isNew ? faFolderPlus : faFileSignature} />
            {project.isNew ? "Create New Project" : "Edit Project Name"}
          </h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors p-2">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            {/* Project ID Field */}
            <div>
              <label className={labelStyle}>
                <FontAwesomeIcon icon={faHashtag} className="text-indigo-400" />
                System Project ID
              </label>
              <input 
                type="text" 
                value={loadingId ? "Generating..." : formData.projectId} 
                readOnly 
                className={readOnlyStyle} 
              />
              <p className="mt-2 text-[10px] text-gray-400 italic">This ID is locked for system integrity.</p>
            </div>

            {/* Project Name Field */}
            <div>
              <label className={labelStyle}>
                <FontAwesomeIcon icon={faFileSignature} className="text-indigo-400" />
                Project Name
              </label>
              <input 
                type="text" 
                name="projectName" 
                value={formData.projectName} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="e.g. FoxTech Q1 Expansion"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loadingId}
              className={`flex items-center justify-center gap-2 px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${loadingId ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
            >
              <FontAwesomeIcon icon={faSave} />
              {project.isNew ? "Launch Project" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditModal;