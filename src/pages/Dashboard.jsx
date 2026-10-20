import React, { useEffect, useState } from "react";
import DashboardSection from "../components/DashboardSection";
import { API_URL } from "../config";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchProjects();
  }, []);

  // GET /projects is already filtered server-side: master sees every
  // project, everyone else only sees projects they're assigned to via
  // project_members (confirmed in projects.service.ts).
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch authorized projects", err);
    } finally {
      setLoading(false);
    }
  };

  const allProjectIds = projects.map((p) => p.projectId);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-700">
        Welcome back, {currentUser?.name || "there"}
      </h2>
      <p className="text-gray-500 mt-2 mb-6">This is your dashboard</p>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
          No projects assigned to you yet.
        </div>
      ) : (
        <>
          <DashboardSection
            title="Total Project's Data"
            projectIds={allProjectIds}
            alwaysExpanded={true}
          />

          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-8 mb-3">
            Data by Projects
          </h3>

          {projects.map((p) => (
            <DashboardSection
              key={p.projectId}
              title={p.projectName}
              projectIds={[p.projectId]}
              alwaysExpanded={false}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Dashboard;