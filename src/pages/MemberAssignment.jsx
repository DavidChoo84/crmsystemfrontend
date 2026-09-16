import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash, faPlus, faFilter, faUndo } from "@fortawesome/free-solid-svg-icons";

import AssignmentDetailModal from "../components/AssignmentDetailModal";
import AssignmentEditModal from "../components/AssignmentEditModal";

const MemberAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  // Selection States
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete modal states
  const [deleteAssignment, setDeleteAssignment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Filter states
  const [filterProject, setFilterProject] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Notification
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchAssignments();
    fetchOptions();
  }, []);

  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), duration);
  };

  // 1. Fetch Assignments
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/project-members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assignments");

      const data = await res.json();
      setAssignments(
        data.sort((a, b) => a.memberName?.localeCompare(b.memberName))
      );
    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      showNotification("Failed to fetch data", "error");
    }
  };

  // 2. Fetch dropdown options (members + projects)
  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [membersRes, projectsRes] = await Promise.all([
        fetch("http://localhost:3000/project-members/members", { headers }),
        fetch("http://localhost:3000/project-members/projects", { headers }),
      ]);

      if (membersRes.ok) setMembers(await membersRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (error) {
      console.error("Failed to fetch dropdown options:", error);
    }
  };

  // 3. Add Assignment
  const handleAdd = () => {
    setEditAssignment({ isNew: true, projectId: "", userId: "" });
    setShowEditModal(true);
  };

  // 4. Edit Assignment
  const handleEdit = (assignment) => {
    setEditAssignment({ ...assignment, isNew: false });
    setShowEditModal(true);
  };

  // 5. Save Logic
  const handleSaveAssignment = async (payload) => {
    try {
      const isUpdate = !payload.isNew;
      const url = isUpdate
        ? `http://localhost:3000/project-members/${payload.originalProjectId}/${payload.originalUserId}`
        : `http://localhost:3000/project-members`;
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ projectId: payload.projectId, userId: payload.userId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save assignment");
      }

      setAssignments((prev) => {
        const withoutOld = isUpdate
          ? prev.filter(
              (a) =>
                !(a.projectId === payload.originalProjectId && a.userId === payload.originalUserId)
            )
          : prev;
        return [...withoutOld, data];
      });

      showNotification(
        isUpdate ? "Assignment updated successfully!" : "Member assigned successfully!",
        "success"
      );

      setShowEditModal(false);
      setEditAssignment(null);
    } catch (err) {
      console.error("Error saving assignment:", err);
      showNotification(err.message || "Failed to save assignment", "error");
    }
  };

  // 6. Delete Logic
  const confirmDelete = (assignment) => {
    setDeleteAssignment(assignment);
    setDeleteModalVisible(true);
    setTimeout(() => setShowDeleteModal(true), 10);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setDeleteModalVisible(false);
      setDeleteAssignment(null);
    }, 300);
  };

  const handleDelete = async () => {
    if (!deleteAssignment) return;
    try {
      const res = await fetch(
        `http://localhost:3000/project-members/${deleteAssignment.projectId}/${deleteAssignment.userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!res.ok) throw new Error("Failed to remove assignment");

      setAssignments((prev) =>
        prev.filter(
          (a) =>
            !(a.projectId === deleteAssignment.projectId && a.userId === deleteAssignment.userId)
        )
      );
      showNotification("Member unassigned successfully!", "success");
    } catch (err) {
      console.error("Error deleting assignment:", err);
      showNotification("Failed to remove assignment", "error");
    } finally {
      closeDeleteModal();
    }
  };

  // 7. Compute filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    if (filterProject && a.projectId !== filterProject) return false;
    if (filterRole && a.memberRole !== filterRole) return false;
    return true;
  });

  const handleClearFilters = () => {
    setFilterProject("");
    setFilterRole("");
  };

  const getRoleColor = (role) => {
    if (role === "master") return "text-purple-600 bg-purple-100";
    if (role === "logistic") return "text-yellow-600 bg-yellow-100";
    return "text-blue-600 bg-blue-100";
  };

  const uniqueRoles = [...new Set(members.map((m) => m.role))];

  return (
    <div className="flex gap-6 relative">
      {/* Notification Toast */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Member Assignment
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            Assign Member
          </button>
        </div>

        {/* Filters Control Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
              <FontAwesomeIcon icon={faFilter} className="text-blue-500" /> Filter:
            </div>

            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-1.5 rounded-lg border bg-gray-50 text-sm focus:outline-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName}
                </option>
              ))}
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1.5 rounded-lg border bg-gray-50 text-sm focus:outline-blue-500"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {(filterProject || filterRole) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600 transition flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faUndo} /> Reset Filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((a) => (
                  <tr
                    key={`${a.projectId}-${a.userId}`}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{a.memberName}</td>
                    <td className="py-3 px-4">{a.memberEmail}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRoleColor(a.memberRole)}`}>
                        {a.memberRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-600">{a.projectName}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => setSelectedAssignment(a)}
                        >
                          <FontAwesomeIcon icon={faEye} className="text-yellow-600" />
                        </button>

                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => handleEdit(a)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-blue-600" />
                        </button>

                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => confirmDelete(a)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No assignments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}

      {/* Edit/Add Modal */}
      {showEditModal && editAssignment && (
        <AssignmentEditModal
          assignment={editAssignment}
          members={members}
          projects={projects}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveAssignment}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && deleteAssignment && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${
            showDeleteModal ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white p-8 rounded-2xl shadow-xl w-[420px] text-center transform transition-transform duration-300 ${
              showDeleteModal
                ? "translate-y-0 opacity-100"
                : "-translate-y-10 opacity-0"
            }`}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Confirm Unassign
            </h3>
            <p className="text-gray-600 mb-6">
              Remove{" "}
              <span className="font-semibold text-red-600">
                {deleteAssignment.memberName}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-red-600">
                {deleteAssignment.projectName}
              </span>
              ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAssignment;