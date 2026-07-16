import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import ProductDetailModal from "../components/ProductDetailModal";
import ProductEditModal from "../components/ProductEditModal";

const ProductList = () => {
  const { projectName } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete modal
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Notification
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchProducts();
  }, [projectName]);

  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), duration);
  };

  // Fetch products for the selected project
  const fetchProducts = async () => {
    try {
      console.log("🔍 1. Debugging Start...");
      console.log("   URL Param (projectName):", projectName);

      const token = localStorage.getItem("token"); // 🚀 Get token

      // 1. Fetch Projects (Secured)
      const resProjects = await fetch("http://localhost:3000/projects", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!resProjects.ok) throw new Error("Failed to fetch projects");
      const projectsData = await resProjects.json();
      
      console.log("   Fetched Projects from DB:", projectsData);

      // 2. Find the Project
      const targetName = decodeURIComponent(projectName).toLowerCase();
      const matchedProject = projectsData.find(
        (p) => p.projectName.toLowerCase() === targetName
      );

      console.log("   Target Name (Lower):", targetName);
      console.log("✅ Matched Project Found:", matchedProject);

      if (!matchedProject) {
        console.error("❌ ERROR: Could not find project with name:", targetName);
        console.warn("   Available names:", projectsData.map(p => p.projectName));
        setProducts([]);
        return; 
      }

      setSelectedProject(matchedProject);

      // 3. Fetch Products (Secured)
      const resProducts = await fetch("http://localhost:3000/products", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const productsData = await resProducts.json();

      console.log("   Fetched All Products:", productsData);

      // 4. Filter Products
      const filtered = productsData.filter((prod) => {
        const prodProjectId = prod.project ? prod.project.projectId : "NULL";
        return prodProjectId === matchedProject.projectId;
      });

      console.log("   Filtered Products for this project:", filtered);

      if (filtered.length === 0) {
        console.warn("⚠️ Project found, but no products are linked to it.");
      }

      setProducts(filtered.sort((a, b) => a.productId.localeCompare(b.productId)));

    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      showNotification("Failed to fetch data", "error");
    }
  };

  // Add Product
  const handleAdd = async () => {
    if (!selectedProject) {
      showNotification("Project not found. Cannot add product.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // 🚀 Get token

      // Fetch next product ID (Secured)
      const res = await fetch("http://localhost:3000/products/next-id", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to get next product ID");
      const data = await res.json();

      setEditProduct({
        isNew: true,
        productId: data.nextId,
        productName: "",
        costing: "",
        quantity: "",
        unit: "",
        quantityPerBox: "",
        project: selectedProject,
      });

      setShowEditModal(true);
    } catch (err) {
      console.error("Error generating product ID:", err);
      showNotification("Failed to generate product ID", "error");
    }
  };

  // Edit Product
  const handleEdit = (product) => {
    setEditProduct({ ...product, isNew: false });
    setShowEditModal(true);
  };

  // Save Product (Add / Update)
  const handleSaveProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem("token"); // 🚀 Get token
      const isUpdate = !updatedProduct.isNew;
      const url = isUpdate
        ? `http://localhost:3000/products/${updatedProduct.productId}`
        : `http://localhost:3000/products`;
      const method = isUpdate ? "PUT" : "POST";

      const bodyData = isUpdate
        ? updatedProduct
        : { ...updatedProduct, project: selectedProject };

      // Save request (Secured)
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🚀 Pass token
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error("Failed to save product");

      const saved = await res.json();

      setProducts((prev) =>
        isUpdate
          ? prev.map((p) => (p.productId === saved.productId ? saved : p))
          : [...prev, saved]
      );

      showNotification(
        isUpdate ? "Product updated successfully!" : "Product added successfully!",
        "success"
      );

      setShowEditModal(false);
      setEditProduct(null);
    } catch (err) {
      console.error("Error saving product:", err);
      showNotification("Failed to save product", "error");
    }
  };

  // Delete Process
  const confirmDelete = (product) => {
    setDeleteProduct(product);
    setDeleteModalVisible(true);
    setTimeout(() => setShowDeleteModal(true), 10);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setDeleteModalVisible(false);
      setDeleteProduct(null);
    }, 300);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      const token = localStorage.getItem("token"); // 🚀 Get token

      // Delete request (Secured)
      const res = await fetch(
        `http://localhost:3000/products/${deleteProduct.productId}`,
        { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}` // 🚀 Pass token
          }
        }
      );

      if (!res.ok) throw new Error("Failed to delete product");

      setProducts((prev) =>
        prev.filter((p) => p.productId !== deleteProduct.productId)
      );

      showNotification("Product deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting product:", err);
      showNotification("Failed to delete product", "error");
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="flex gap-6 relative">
      {/* Notification */}
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
            {projectName} — Product List
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Costing</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Qty / Box</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {products.length > 0 ? (
                products.map((p) => (
                  <tr
                    key={p.productId}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{p.productName}</td>
                    <td className="py-3 px-4">{p.costing}</td>
                    <td className="py-3 px-4">{p.quantity}</td>
                    <td className="py-3 px-4">{p.unit}</td>
                    <td className="py-3 px-10">{p.quantityPerBox}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => setSelectedProduct(p)}
                        >
                          <FontAwesomeIcon icon={faEye} className="text-yellow-600" />
                        </button>

                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => handleEdit(p)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-blue-600" />
                        </button>

                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => confirmDelete(p)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {showEditModal && editProduct && (
        <ProductEditModal
          product={editProduct}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProduct}
        />
      )}

      {deleteModalVisible && deleteProduct && (
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
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-600">
                {deleteProduct.productName}
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;