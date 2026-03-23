// src/pages/ProjectRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDefaultProject = async () => {
      try {
        const res = await fetch("http://localhost:3000/projects"); // backend URL
        const data = await res.json();

        if (data.length > 0) {
          // Find the project with the smallest projectId
          const defaultProject = data.reduce((prev, curr) =>
            prev.projectId < curr.projectId ? prev : curr
          );

          // Navigate using projectName
          const encodedName = encodeURIComponent(defaultProject.projectName);
          navigate(`/project/${encodedName}`);
        } else {
          alert("No projects found in database!");
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      }
    };

    fetchDefaultProject();
  }, [navigate]);

  return <div>Loading project...</div>;
}
