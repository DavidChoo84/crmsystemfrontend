import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    costing: "",
    quantity: "",
    unit: "",
    quantityPerBox: "",
    projectId: "",
  });

  // ✅ Allow modal to open even when product = null (Add mode)
  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.productId || "",
        productName: product.productName || "",
        costing: product.costing || "",
        quantity: product.quantity || "",
        unit: product.unit || "",
        quantityPerBox: product.quantityPerBox || "",
        projectId: product.projectId || product.project?.projectId || "",
      });
    }
  }, [product]);

  // ❌ REMOVE this check — it caused modal not to show during Add
  // if (!product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, isNew: product?.isNew });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative text-gray-800"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-5 text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>

          <h2 className="text-2xl font-semibold text-center mb-6">
            {product?.isNew ? "Add Product" : "Edit Product"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Product ID (readonly) */}
            <div className="flex flex-col col-span-1">
              <label className="text-sm text-gray-500 mb-1">Product ID</label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                readOnly
                className="px-3 py-2 rounded-full text-center font-medium border bg-gray-100 text-gray-600 border-gray-200"
              />
            </div>

            {/* Project ID (readonly) */}
            <div className="flex flex-col col-span-1">
              <label className="text-sm text-gray-500 mb-1">Project ID</label>
              <input
                type="text"
                name="projectId"
                value={formData.projectId}
                readOnly
                className="px-3 py-2 rounded-full text-center font-medium border bg-gray-100 text-gray-600 border-gray-200"
              />
            </div>

            {/* Editable fields */}
            {[
              ["Product Name", "productName"],
              ["Costing", "costing"],
              ["Quantity", "quantity"],
              ["Unit", "unit"],
              ["Qty / Box", "quantityPerBox"],
            ].map(([label, name]) => (
              <div key={name} className="flex flex-col col-span-1">
                <label className="text-sm text-gray-500 mb-1">{label}</label>
                <input
                  type={
                    ["costing", "quantity", "quantityPerBox"].includes(name)
                      ? "number"
                      : "text"
                  }
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-full text-center font-medium border bg-blue-50 text-blue-700 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium"
            >
              {product?.isNew ? "Add Product" : "Save Changes"}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductEditModal;
