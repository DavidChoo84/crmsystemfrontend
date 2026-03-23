import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faGift, faBoxOpen } from "@fortawesome/free-solid-svg-icons";

const PackageEditModal = ({ pkg, projectId, onClose, onSave }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [formData, setFormData] = useState({
    packageId: "",
    projectId: "",
    packageName: "",
    sellingPrice: 0,
    shippingCost: 0,
    totalCost: 0,
    average: 0,
    costMargin: 0,
    isNew: false,
    packageProducts: [
      { productId: "", quantity: 1, isFreeItem: false }
    ], 
  });

  // --- 1. Centralized Calculation Logic ---
  const recalculateStats = useCallback((currentData, currentProducts) => {
    let productCostSum = 0;
    let totalQuantity = 0;

    currentData.packageProducts.forEach(item => {
      const prod = currentProducts.find(p => p.productId === item.productId);
      const qty = parseFloat(item.quantity) || 0;
      
      if (prod) {
        productCostSum += (parseFloat(prod.costing || 0) * qty);
      }
      totalQuantity += qty;
    });

    const selling = parseFloat(currentData.sellingPrice) || 0;
    const shipping = parseFloat(currentData.shippingCost) || 0;
    const totalCost = productCostSum + shipping;
    const average = totalQuantity > 0 ? (selling / totalQuantity) : 0;
    const costMargin = selling > 0 ? ((totalCost / selling) * 100) : 0;

    return {
      ...currentData,
      totalCost: totalCost.toFixed(2),
      average: average.toFixed(2),
      costMargin: costMargin.toFixed(2)
    };
  }, []);

  // --- 2. Load Initial Data ---
  useEffect(() => {
    if (pkg) {
      setFormData({
        ...pkg,
        projectId: pkg.project?.projectId ?? projectId,
        packageProducts: pkg.packageProducts && pkg.packageProducts.length > 0 
          ? pkg.packageProducts.map(item => ({
              // ✅ CRITICAL FIX: Retain packageProductId so the backend updates instead of recreates
              packageProductId: item.packageProductId || undefined,
              productId: item.product?.productId || item.productId,
              quantity: item.quantity,
              isFreeItem: item.isFreeItem
            }))
          : [{ productId: "", quantity: 1, isFreeItem: false }]
      });
    } else {
        setFormData(prev => ({ ...prev, projectId: projectId, isNew: true }));
    }
  }, [pkg, projectId]);

  // --- 3. Fetch Products & Recalculate once loaded ---
  useEffect(() => {
    const targetProjectId = formData.projectId || projectId;
    if (!targetProjectId) return;

    setLoadingProducts(true);

    fetch(`http://localhost:3000/products`) 
      .then(res => res.json())
      .then(data => {
        const projectProducts = data.filter(p => 
            p.project?.projectId === targetProjectId || p.projectId === targetProjectId
        );
        setProducts(projectProducts);
        setFormData(prev => recalculateStats(prev, projectProducts));
      })
      .catch(err => console.error("Failed to load products", err))
      .finally(() => setLoadingProducts(false));
  }, [formData.projectId, projectId, recalculateStats]);

  // --- 4. Handle Text Inputs ---
  const handleMainChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    const calculated = recalculateStats(newData, products);
    setFormData(calculated);
  };

  // --- 5. Handle Item List Changes (Product, Qty) ---
  const handleItemChange = (index, field, value) => {
    // ✅ FIX: Immutable state update
    const newItems = formData.packageProducts.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    
    const newData = { ...formData, packageProducts: newItems };
    const calculated = recalculateStats(newData, products);
    setFormData(calculated);
  };

  const addItemRow = () => {
    const newData = {
      ...formData,
      packageProducts: [
        ...formData.packageProducts,
        // ✅ New items naturally don't have a packageProductId, so the backend will create one
        { productId: "", quantity: 1, isFreeItem: true }
      ]
    };
    setFormData(recalculateStats(newData, products));
  };

  const removeItemRow = (index) => {
    const newItems = formData.packageProducts.filter((_, i) => i !== index);
    const newData = { ...formData, packageProducts: newItems };
    setFormData(recalculateStats(newData, products));
  };

  // --- 6. Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      // ✅ FIX: Safe parsing handles edge cases where users clear inputs
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      shippingCost: parseFloat(formData.shippingCost) || 0,
      totalCost: parseFloat(formData.totalCost) || 0,
      costMargin: parseFloat(formData.costMargin) || 0,
      average: parseFloat(formData.average) || 0,
      // The filter naturally keeps packageProductId along with the other fields!
      packageProducts: formData.packageProducts.filter(item => item.productId !== "") 
    };
    onSave(payload);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative text-gray-800 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-2xl transition"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600" />
          {formData.isNew ? "Create New Package" : "Edit Package"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT: DETAILS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-2">Package Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Package ID</label>
                <input type="text" value={formData.packageId} readOnly className="w-full mt-1 px-3 py-2 bg-gray-100 border rounded-lg text-sm text-gray-600" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Project ID</label>
                <input type="text" value={formData.projectId} readOnly className="w-full mt-1 px-3 py-2 bg-gray-100 border rounded-lg text-sm text-gray-600" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Package Name</label>
              <input type="text" name="packageName" value={formData.packageName} onChange={handleMainChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Selling Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">RM</span>
                  <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleMainChange} className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Shipping Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">RM</span>
                  <input type="number" name="shippingCost" value={formData.shippingCost} onChange={handleMainChange} className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* STATS DISPLAY */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                <label className="text-xs font-bold text-gray-500 block">Total Cost</label>
                <span className="text-lg font-bold text-gray-800">RM {formData.totalCost}</span>
                <p className="text-[10px] text-gray-400">(Products + Shipping)</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block">Cost Margin</label>
                <span className={`text-lg font-bold ${parseFloat(formData.costMargin) > 100 ? 'text-red-500' : 'text-blue-600'}`}>
                  {formData.costMargin}%
                </span>
                 <p className="text-[10px] text-gray-400">(Total Cost / Selling)</p>
              </div>
              <div className="col-span-2 border-t pt-2 mt-1">
                <label className="text-xs font-bold text-gray-500 block">Average Price / Qty</label>
                <span className="text-md font-medium text-gray-700">RM {formData.average} / unit</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENTS */}
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex justify-between items-end border-b pb-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase">Package Contents</h3>
              <button type="button" onClick={addItemRow} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 font-semibold flex items-center gap-1">
                <FontAwesomeIcon icon={faPlus} /> Add Item
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[400px]">
              {formData.packageProducts.map((item, index) => {
                const isMainProduct = index === 0; // Lock first item

                return (
                  <div key={index} className={`flex gap-2 items-center p-3 rounded-lg border ${isMainProduct ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                    
                    <div className="flex-1">
                      <label className={`text-xs font-bold block mb-1 ${isMainProduct ? "text-blue-600" : "text-gray-400"}`}>
                         {isMainProduct 
                            ? "★ Main Product" 
                            : (item.isFreeItem ? <span className="text-green-600"><FontAwesomeIcon icon={faGift} /> Free Gift</span> : "Add-on / Extra")}
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                        className="w-full text-sm border-gray-300 rounded bg-white py-1 px-2 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.productId} value={p.productId}>
                            {p.productName} (Cost: {p.costing})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <label className="text-xs text-gray-400 font-semibold block mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                        className="w-full text-sm border-gray-300 rounded py-1 px-2 text-center focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="pt-5">
                      <button 
                        type="button"
                        disabled={isMainProduct}
                        onClick={() => handleItemChange(index, "isFreeItem", !item.isFreeItem)}
                        className={`p-2 rounded text-xs transition ${isMainProduct ? 'opacity-30 cursor-not-allowed' : ''} ${item.isFreeItem ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                      >
                        <FontAwesomeIcon icon={faGift} />
                      </button>
                    </div>

                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => !isMainProduct && removeItemRow(index)}
                        disabled={isMainProduct}
                        className={`p-2 transition ${isMainProduct ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg">Save Package</button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default PackageEditModal;