import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    costing: "",
    quantity: "",
    unit: "",
    quantityPerBox: "",
    projectId: "",
    parentProductId: "",
  });

  const [availableParents, setAvailableParents] = useState([]);

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
        parentProductId: product.parentProductId || "",
      });
    }
  }, [product]);

  // Fetch candidate parent products — same project, excluding this product itself
  // (a product can't be its own parent) and excluding any product that is
  // already a sub-product itself (keeps the hierarchy to one level).
  useEffect(() => {
    if (!formData.projectId) return;

    const token = localStorage.getItem("token");
    fetch(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const candidates = (Array.isArray(data) ? data : []).filter(
          (p) =>
            p.projectId === formData.projectId &&
            p.productId !== formData.productId &&
            !p.parentProductId
        );
        setAvailableParents(candidates);
      })
      .catch((err) => console.error("Failed to fetch parent product options", err));
  }, [formData.projectId, formData.productId]);

  // ❌ REMOVE this check — it caused modal not to show during Add
  // if (!product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Selecting a parent resets this product's Quantity to 0, since a
  // sub-product's stock is meant to be governed by the parent (auto-
  // replenished), not tracked as a real starting count. The conversion
  // ratio itself is never stored here — it's read from the parent's own
  // Qty/Box directly at order time, so it can never drift out of sync.
  const handleParentChange = (e) => {
    const selectedParentId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      parentProductId: selectedParentId,
      quantity: selectedParentId ? 0 : prev.quantity,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isSubProduct = !!formData.parentProductId;
    onSave({
      ...formData,
      // Send null rather than "" when no parent is selected
      parentProductId: formData.parentProductId || null,
      // 🔑 FIX: Qty/Box is locked (uneditable) for sub-products, so it stays
      // as an empty string on a brand-new product — MySQL rejects '' for
      // an int column. Skip the check entirely and just send 0.
      quantityPerBox: isSubProduct ? 0 : formData.quantityPerBox,
      quantity: isSubProduct ? 0 : formData.quantity,
      isNew: product?.isNew,
    });
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

            {/* Editable fields — Quantity, Unit, and Qty/Box lock once a
                parent is chosen, since a sub-product's stock is governed
                by the parent (auto-replenished), not tracked independently. */}
            {[
              ["Product Name", "productName"],
              ["Costing", "costing"],
              ["Quantity", "quantity"],
              ["Unit", "unit"],
              ["Qty / Box", "quantityPerBox"],
            ].map(([label, name]) => {
              const isLockable = ["quantity", "quantityPerBox"].includes(name);
              const isLocked = isLockable && !!formData.parentProductId;

              return (
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
                    disabled={isLocked}
                    className={`px-3 py-2 rounded-full text-center font-medium border focus:outline-none focus:ring-2 transition ${
                      isLocked
                        ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400"
                    }`}
                  />
                </div>
              );
            })}

            {/* Parent Product — makes this a sub-product (e.g. "Vitamin A (Plate)") */}
            <div className="flex flex-col col-span-2">
              <label className="text-sm text-gray-500 mb-1">
                Parent Product <span className="text-gray-400">(optional — makes this a sub-product)</span>
              </label>
              <select
                name="parentProductId"
                value={formData.parentProductId}
                onChange={handleParentChange}
                className="px-3 py-2 rounded-full text-center font-medium border bg-purple-50 text-purple-700 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">None (standalone product)</option>
                {availableParents.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} ({p.productId})
                  </option>
                ))}
              </select>
            </div>
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