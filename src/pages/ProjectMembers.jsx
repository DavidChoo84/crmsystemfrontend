import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear, faArrowLeft, faPlus, faRightLeft, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

const ProjectMembers = () => {
  const { projectName } = useParams();
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState("");
  const [assignments, setAssignments] = useState([]); // all assignments system-wide
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState("");

  const [reassignTarget, setReassignTarget] = useState(null);
  const [newProjectId, setNewProjectId] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchProjectId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName]);

  useEffect(() => {
    if (projectId) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProjectId = async () => {
    try {
      const res = await fetch(`http://localhost:3000/projects/name/${encodeURIComponent(projectName)}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Project not found");
      const data = await res.json();
      setProjectId(data.projectId);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load project", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    try {
      const [assignRes, membersRes, projectsRes] = await Promise.all([
        fetch("http://localhost:3000/project-members", { headers: authHeaders() }),
        fetch("http://localhost:3000/project-members/members", { headers: authHeaders() }),
        fetch("http://localhost:3000/project-members/projects", { headers: authHeaders() }),
      ]);
      if (assignRes.ok) setAssignments(await assignRes.json());
      if (membersRes.ok) setMembers(await membersRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (err) {
      console.error(err);
      showNotification("Failed to load member data", "error");
    }
  };

  const currentProjectAssignments = assignments.filter((a) => a.projectId === projectId);
  const assignedUserIds = new Set(currentProjectAssignments.map((a) => a.userId));
  const availableMembersToAssign = members.filter((m) => !assignedUserIds.has(m.userId));

  // --- Assign a new member to this project ---
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!newMemberUserId) return;
    try {
      const res = await fetch("http://localhost:3000/project-members", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ projectId, userId: newMemberUserId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to assign member");

      setAssignments((prev) => [...prev, data]);
      showNotification("Member assigned to this project!");
      setShowAssignModal(false);
      setNewMemberUserId("");
    } catch (err) {
      showNotification(err.message || "Failed to assign member", "error");
    }
  };

  // --- Reassign an existing member to a different project ---
  const openReassign = (assignment) => {
    setReassignTarget(assignment);
    setNewProjectId("");
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignTarget || !newProjectId) return;
    try {
      const res = await fetch(
        `http://localhost:3000/project-members/${reassignTarget.projectId}/${reassignTarget.userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ projectId: newProjectId, userId: reassignTarget.userId }),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to reassign member");

      setAssignments((prev) =>
        prev
          .filter((a) => !(a.projectId === reassignTarget.projectId && a.userId === reassignTarget.userId))
          .concat(data)
      );
      showNotification(`${reassignTarget.memberName} reassigned successfully!`);
      setReassignTarget(null);
    } catch (err) {
      showNotification(err.message || "Failed to reassign member", "error");
    }
  };

  // --- Remove member from this project ---
  const confirmDelete = (assignment) => {
    setDeleteTarget(assignment);
    setDeleteModalVisible(true);
    setTimeout(() => setShowDeleteModal(true), 10);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setDeleteModalVisible(false);
      setDeleteTarget(null);
    }, 300);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `http://localhost:3000/project-members/${deleteTarget.projectId}/${deleteTarget.userId}`,
        { method: "DELETE", headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Failed to remove member");
      setAssignments((prev) =>
        prev.filter((a) => !(a.projectId === deleteTarget.projectId && a.userId === deleteTarget.userId))
      );
      showNotification("Member removed from this project.");
    } catch (err) {
      showNotification(err.message || "Failed to remove member", "error");
    } finally {
      closeDeleteModal();
    }
  };

  const getRoleColor = (role) => {
    if (role === "master") return "text-purple-600 bg-purple-100";
    if (role === "logistic") return "text-yellow-600 bg-yellow-100";
    return "text-blue-600 bg-blue-100";
  };

  if (loading) return <div className="p-10 text-gray-400 animate-pulse font-medium text-center">Loading...</div>;

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      {notification.message && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${notification.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/project/${encodeURIComponent(projectName)}`)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faUserGear} className="text-purple-500" />
              Member Assignment
            </h2>
            <p className="text-gray-400 text-sm capitalize">{projectName}</p>
          </div>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
        >
          <FontAwesomeIcon icon={faPlus} /> Assign Member
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="py-3 px-6">Member</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {currentProjectAssignments.length > 0 ? (
              currentProjectAssignments.map((a) => (
                <tr key={a.userId} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 font-medium">{a.memberName}</td>
                  <td className="py-3 px-6">{a.memberEmail}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRoleColor(a.memberRole)}`}>
                      {a.memberRole}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openReassign(a)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center gap-1.5 transition"
                        title="Reassign to another project"
                      >
                        <FontAwesomeIcon icon={faRightLeft} /> Reassign
                      </button>
                      <button
                        onClick={() => confirmDelete(a)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-red-600 transition"
                        title="Remove from this project"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  No members assigned to this project yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ASSIGN NEW MEMBER MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 relative">
            <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Assign Member to {projectName}</h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
                <select
                  value={newMemberUserId}
                  onChange={(e) => setNewMemberUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a member</option>
                  {availableMembersToAssign.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.name} ({m.role})</option>
                  ))}
                </select>
                {availableMembersToAssign.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">All members are already assigned to this project.</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN MODAL */}
      {reassignTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 relative">
            <button onClick={() => setReassignTarget(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Reassign Member</h3>
            <p className="text-sm text-gray-500 mb-6">
              Move <span className="font-semibold text-gray-800">{reassignTarget.memberName}</span> from{" "}
              <span className="font-semibold text-gray-800">{projectName}</span> to a different project.
            </p>
            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a project</option>
                  {projects.filter((p) => p.projectId !== projectId).map((p) => (
                    <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setReassignTarget(null)} className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Reassign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalVisible && deleteTarget && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${showDeleteModal ? "opacity-100" : "opacity-0"}`}>
          <div className={`bg-white p-8 rounded-2xl shadow-xl w-[420px] text-center transform transition-transform duration-300 ${showDeleteModal ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Remove Member?</h3>
            <p className="text-gray-600 mb-6">
              Remove <span className="font-semibold text-red-600">{deleteTarget.memberName}</span> from{" "}
              <span className="font-semibold text-red-600">{projectName}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={closeDeleteModal} className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMembers;