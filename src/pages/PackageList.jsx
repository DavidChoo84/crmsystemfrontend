import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import PackageDetailModal from "../components/PackageDetailModal";
import PackageEditModal from "../components/PackageEditModal";

const PackageList = () => {
  const { projectName } = useParams();
  const [packages, setPackages] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // REMOVED: const [projectId, setProjectId] = useState(null); (Redundant)

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [editPackage, setEditPackage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete modal
  const [deletePackage, setDeletePackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchPackages();
  }, [projectName]);

  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), duration);
  };

  const fetchPackages = async () => {
    try {
      // 1. Fetch Projects
      const resProjects = await fetch("http://localhost:3000/projects");
      const projectsData = await resProjects.json();

      const matchedProject = projectsData.find(
        (p) =>
          p.projectName.toLowerCase() ===
          decodeURIComponent(projectName).toLowerCase()
      );
      setSelectedProject(matchedProject || null);

      if (!matchedProject) {
        setPackages([]);
        return;
      }

      // 2. Fetch Packages
      const resPackages = await fetch("http://localhost:3000/packages");
      const packagesData = await resPackages.json();

      // 3. Filter & Sort
      const filtered = packagesData
        .filter((pkg) => pkg.project?.projectId === matchedProject.projectId)
        .sort((a, b) => a.packageId.localeCompare(b.packageId));

      setPackages(filtered);
    } catch (error) {
      console.error("Error fetching packages:", error);
      showNotification("Failed to fetch packages", "error");
    }
  };

  // ➕ Add Package
  const handleAdd = async () => {
    if (!selectedProject){
      showNotification("Project not found. Cannot add package.", "error");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/packages/next-id");
      if (!res.ok) throw new Error("Failed to get next ID");
      const data = await res.json();

      setEditPackage({
        isNew: true,
        packageId: data.nextId,
        projectId: selectedProject.projectId, // Fix: Use ID string
        packageName: "",
        sellingPrice: 0,
        shippingCost: 0, // Added based on new Schema
        totalCost: 0,
        costMargin: 0,
        // FIX: Replaced flat fields with array
        packageProducts: [] 
      });

      setShowEditModal(true);
    } catch (err) {
      console.error("Error generating package ID:", err)
      showNotification("Failed to generate ID", "error");
    }
  };

  const handleEdit = (pkg) => {
    setEditPackage({...pkg, isNew:false });
    setShowEditModal(true);
  }

const handleSavePackage = async (updatedPackage) => {
    try {
      const isUpdate = !updatedPackage.isNew;
      const url = isUpdate
        ? `http://localhost:3000/packages/${updatedPackage.packageId}`
        : `http://localhost:3000/packages`;
      
      const method = isUpdate ? "PATCH" : "POST";

      // 🔴 FIX: Ensure we send 'projectId' (string), NOT 'project' (object)
      const payload = {
        ...updatedPackage,
        projectId: updatedPackage.projectId || selectedProject?.projectId 
      };

      // Clean up: Remove the full project object if it exists to avoid backend confusion
      delete payload.project; 

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Send 'payload' instead of 'bodyData'
      });

      // 🔴 IMPROVEMENT: Log the actual server error if it fails
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server Error Detail:", errorData); // This helps you debug!
        throw new Error(errorData.message || "Failed to save package");
      }

      const saved = await res.json();

      setPackages((prev) =>
        isUpdate
          ? prev.map((p) => (p.packageId === saved.packageId ? saved : p))
          : [...prev, saved]
      );

      await fetchPackages();
      
      showNotification(
        isUpdate ? "Package updated!" : "Package added!",
        "success"
      );

      setShowEditModal(false);
      setEditPackage(null);
    } catch (err) {
      console.error("Error saving package:", err);
      // Show the actual error message from backend if possible
      showNotification(err.message || "Failed to save package", "error");
    }
  };

  // --- Delete Logic (Same as yours) ---
  const confirmDelete = (pkg) => {
    setDeletePackage(pkg);
    setDeleteModalVisible(true);
    setTimeout(() => setShowDeleteModal(true), 10);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setDeleteModalVisible(false);
      setDeletePackage(null);
    }, 300);
  };

  const handleDelete = async () => {
    if (!deletePackage) return;
    try {
      const res = await fetch(
        `http://localhost:3000/packages/${deletePackage.packageId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");

      setPackages((prev) =>
        prev.filter((p) => p.packageId !== deletePackage.packageId)
      );
      showNotification("Package deleted!", "success");
    } catch (err) {
      showNotification("Failed to delete package", "error");
    } finally {
      closeDeleteModal();
    }
  };

  // --- Render Helper: Get Package Content Summary ---
  const renderPackageContent = (pkg) => {
    if (!pkg.packageProducts || pkg.packageProducts.length === 0) return <span className="text-gray-400 italic">Empty</span>;
    
    // Show first item name + count of others
    const firstItem = pkg.packageProducts[0]?.product?.productName || "Unknown Item";
    const count = pkg.packageProducts.length;
    
    return (
      <div>
        <span className="font-medium text-gray-700">{firstItem}</span>
        {count > 1 && <span className="text-xs text-gray-500 ml-1">(+{count - 1} more)</span>}
      </div>
    );
  };

  return (
    <div className="flex gap-6 relative">
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {projectName} — Package List
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Package
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Package Name</th>
                <th className="py-3 px-4">Contents</th> {/* Renamed from Product */}
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {packages.length > 0 ? (
                packages.map((p) => (
                  <tr key={p.packageId} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-blue-600">{p.packageId}</td>
                    <td className="py-3 px-4">{p.packageName}</td>
                    
                    {/* NEW: Render Summary of Items */}
                    <td className="py-3 px-4">{renderPackageContent(p)}</td>

                    <td className="py-3 px-4">{Number(p.sellingPrice).toFixed(2)}</td>
                    <td className="py-3 px-4">{Number(p.totalCost).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${Number(p.costMargin) > 30 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {Number(p.costMargin || 0).toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => setSelectedPackage(p)}>
                          <FontAwesomeIcon icon={faEye} className="text-yellow-600" />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => handleEdit(p)}>
                          <FontAwesomeIcon icon={faPenToSquare} className="text-blue-600" />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => confirmDelete(p)}>
                          <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">No packages found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PackageDetailModal pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />

      {showEditModal && editPackage && (
        <PackageEditModal
          pkg={editPackage}
          // FIX: Pass the actual project ID safely
          projectId={selectedProject?.projectId} 
          onClose={() => setShowEditModal(false)}
          onSave={handleSavePackage}
        />
      )}

      {/* Delete Modal Code ... (kept same as yours) */}
      {deleteModalVisible && deletePackage && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${showDeleteModal ? "opacity-100" : "opacity-0"}`}>
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[420px] text-center">
             <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Delete</h3>
             <p className="text-gray-600 mb-6">Delete <span className="font-bold text-red-600">{deletePackage.packageName}</span>?</p>
             <div className="flex justify-center gap-4">
               <button onClick={closeDeleteModal} className="px-4 py-2 rounded-full bg-gray-200">Cancel</button>
               <button onClick={handleDelete} className="px-4 py-2 rounded-full bg-red-600 text-white">Delete</button>
             </div>
          </div>
        </div>
      )}

      {notification.message && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default PackageList;