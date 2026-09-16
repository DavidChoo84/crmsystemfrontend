import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const AssignmentDetailModal = ({ assignment, onClose }) => {
  if (!assignment) return null;

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
          Assignment Details
        </h3>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">Member</div>
            <div className="text-gray-800 font-medium">{assignment.memberName}</div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">Email</div>
            <div className="text-gray-800">{assignment.memberEmail}</div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">Role</div>
            <div className="text-gray-800 capitalize">{assignment.memberRole}</div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">Project</div>
            <div className="text-gray-800 font-medium">{assignment.projectName}</div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;