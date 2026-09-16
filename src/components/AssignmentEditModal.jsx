import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const AssignmentEditModal = ({ assignment, members, projects, onClose, onSave }) => {
  const [userId, setUserId] = useState(assignment.userId || "");
  const [projectId, setProjectId] = useState(assignment.projectId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUserId(assignment.userId || "");
    setProjectId(assignment.projectId || "");
  }, [assignment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId || !projectId) {
      setError("Please select both a member and a project.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        isNew: assignment.isNew,
        userId,
        projectId,
        originalUserId: assignment.userId,
        originalProjectId: assignment.projectId,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {assignment.isNew ? "Assign Member to Project" : "Edit Assignment"}
        </h3>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Select a member</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {saving ? "Saving..." : assignment.isNew ? "Assign" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentEditModal;