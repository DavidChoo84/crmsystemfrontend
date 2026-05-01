import React, { useState, useEffect, useRef } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faSave, faTrash, faUserCheck, faTruck 
} from "@fortawesome/free-solid-svg-icons";

const OrderEditModal = ({ order, onClose, onSave }) => {
  const [nextId, setNextId] = useState("");
  const [availablePackages, setAvailablePackages] = useState([]);
  
  // Track the current order to prevent state resets while typing
  const initializedOrderId = useRef(null);

  // Helper: Format date to local ISO string (YYYY-MM-DDTHH:mm) for datetime-local input
  const formatLocalDate = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // --- 1. STATE DEFINITION ---
  const [formData, setFormData] = useState({
    ...order,
    orderId: order.orderId || "",
    customerId: order.customerId || "",
    customerName: order.customerName || "",
    orderDate: formatLocalDate(order.orderDate),
    shippingFee: Number(order.shippingFee) || 0,
    totalAmount: Number(order.totalAmount) || 0,
    orderPackages: order.orderPackages || [],
    // Initialize logistics to empty strings to avoid "uncontrolled" warnings
    courierCompany: order.courierCompany || "",
    trackingNumber: order.trackingNumber || ""
  });

  // --- 2. EFFECTS ---

  // Sync state if a different order is selected (or when modal opens)
  useEffect(() => {
    const currentId = order.orderId || "new-order";
    if (order && currentId !== initializedOrderId.current) {
      setFormData({
        ...order,
        orderId: order.orderId || "",
        customerId: order.customerId || "",
        customerName: order.customerName || "",
        orderDate: formatLocalDate(order.orderDate),
        orderPackages: order.orderPackages || [],
        shippingFee: Number(order.shippingFee) || 0,
        courierCompany: order.courierCompany || "",
        trackingNumber: order.trackingNumber || ""
      });
      initializedOrderId.current = currentId;
    }
  }, [order]);

  // Fetch Next ID for New Orders
  useEffect(() => {
    if (order.isNew && !nextId) {
      axios.get("http://localhost:3000/orders/next-id")
        .then(res => setNextId(res.data.nextId))
        .catch(err => console.error("Error fetching next ID", err));
    }
  }, [order.isNew, nextId]);

  // Fetch Package Templates
  useEffect(() => {
    axios.get("http://localhost:3000/packages")
      .then(res => setAvailablePackages(res.data))
      .catch(err => console.error("Failed to fetch templates", err));
  }, []);

  // Auto-calculate Total Amount
  useEffect(() => {
    const pkgTotal = formData.orderPackages.reduce((sum, pkg) => 
      sum + (Number(pkg.packagePrice || 0) * Number(pkg.quantity || 0)), 0);
    
    const grandTotal = pkgTotal + Number(formData.shippingFee || 0);
    
    if (grandTotal !== formData.totalAmount) {
      setFormData(prev => ({ ...prev, totalAmount: grandTotal }));
    }
  }, [formData.orderPackages, formData.shippingFee, formData.totalAmount]);

  // --- 3. HANDLERS ---

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value 
    }));
  };

  const handlePackageChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      orderPackages: prev.orderPackages.map((pkg, i) => 
        i === index ? { 
          ...pkg, 
          [field]: (field === 'packagePrice' || field === 'quantity') ? (value === "" ? "" : Number(value)) : value 
        } : pkg
      )
    }));
  };

  const handleAddFromTemplate = (e) => {
    const templateId = e.target.value;
    if (!templateId) return;
    
    const template = availablePackages.find(p => p.packageId === templateId);
    if (!template) return;

    const newPkg = {
      packageName: template.packageName,
      packagePrice: Number(template.sellingPrice),
      quantity: 1,
      orderProducts: template.packageProducts?.map(pp => ({
        productId: pp.product?.productId || "",
        productName: pp.product?.productName || "Unknown",
        unitCost: pp.product?.costPrice || 0,
        quantity: pp.quantity
      })) || []
    };

    setFormData(prev => ({ 
      ...prev, 
      orderPackages: [...prev.orderPackages, newPkg] 
    }));
    e.target.value = ""; 
  };

  const addBlankPackage = () => {
    setFormData(prev => ({ 
      ...prev, 
      orderPackages: [...prev.orderPackages, { packageName: "", packagePrice: 0, quantity: 1, orderProducts: [] }] 
    }));
  };

  const removePackage = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      orderPackages: prev.orderPackages.filter((_, i) => i !== index) 
    }));
  };

  const handleCustomerSelect = (selectedOption) => {
    if (selectedOption) {
      const { customer } = selectedOption;
      setFormData(prev => ({
        ...prev,
        customerId: customer.customerId,
        customerName: customer.name,
        // Auto-fill other fields if needed
        address: customer.address || "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      orderId: order.isNew ? nextId : formData.orderId
    });
  };

  // --- 4. ASYNC SELECT HELPERS ---
  const loadCustomerOptions = async (inputValue) => {
    try {
      const url = inputValue.length > 0 
        ? `http://localhost:3000/customers/search?q=${inputValue}`
        : `http://localhost:3000/customers`;
      const res = await axios.get(url);
      return res.data.map(c => ({
        value: c.customerId,
        label: `${c.name} (${c.customerId})`,
        customer: c 
      }));
    } catch (err) {
      return [];
    }
  };

  // --- 5. STYLES ---
  const inputStyle = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const readOnlyStyle = "w-full bg-gray-100 border-none rounded-lg px-4 py-2.5 text-sm font-mono text-gray-500 cursor-not-allowed";
  const labelStyle = "block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-indigo-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white">
            {order.isNew ? "✨ New Order" : `📝 Order #${order.orderId}`}
          </h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8">
          
          {/* Section 1: Customer & Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div>
              <label className={labelStyle}>Order ID</label>
              <input type="text" value={order.isNew ? nextId : formData.orderId} readOnly className={readOnlyStyle} />
            </div>
            <div>
              <label className={labelStyle}>Order Date</label>
              <input type="datetime-local" name="orderDate" value={formData.orderDate} onChange={handleChange} className={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}><FontAwesomeIcon icon={faUserCheck} className="mr-1"/> Customer</label>
              <AsyncSelect 
                cacheOptions defaultOptions
                loadOptions={loadCustomerOptions}
                onChange={handleCustomerSelect}
                placeholder="Search customer..."
                value={formData.customerId ? { label: formData.customerName, value: formData.customerId } : null}
                styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', minHeight: '42px' }) }}
              />
            </div>
          </div>

          {/* Section 2: Packages */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Order Items</h4>
              <div className="flex gap-2">
                <select onChange={handleAddFromTemplate} className="text-xs border border-indigo-200 rounded-lg px-3 py-1.5 bg-white text-indigo-700 font-bold outline-none">
                  <option value="">+ From Template</option>
                  {availablePackages.map(p => (
                    <option key={p.packageId} value={p.packageId}>{p.packageName}</option>
                  ))}
                </select>
                <button type="button" onClick={addBlankPackage} className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition">
                  + Custom
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {formData.orderPackages.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-2xl text-gray-400 text-sm">
                  No items added to this order.
                </div>
              ) : (
                formData.orderPackages.map((pkg, index) => (
                  <div key={index} className="flex gap-4 items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Package Description</label>
                      <input type="text" value={pkg.packageName} onChange={(e) => handlePackageChange(index, "packageName", e.target.value)} className={inputStyle} placeholder="Enter name..." />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Price (RM)</label>
                      <input type="number" value={pkg.packagePrice} onChange={(e) => handlePackageChange(index, "packagePrice", e.target.value)} className={inputStyle} />
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                      <input type="number" value={pkg.quantity} onChange={(e) => handlePackageChange(index, "quantity", e.target.value)} className={inputStyle} />
                    </div>
                    <button type="button" onClick={() => removePackage(index)} className="p-2.5 text-gray-400 hover:text-red-500 transition">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Logistics & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
            <div className="space-y-4">
               <h4 className="text-indigo-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                 <FontAwesomeIcon icon={faTruck} /> Logistics Info
               </h4>
               <input type="text" name="courierCompany" value={formData.courierCompany} onChange={handleChange} placeholder="Courier Company (e.g. J&T)" className={inputStyle} />
               <input type="text" name="trackingNumber" value={formData.trackingNumber} onChange={handleChange} placeholder="Tracking Number" className={inputStyle} />
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
               <div className="flex justify-between items-center mb-4 opacity-80">
                 <span className="text-xs font-bold uppercase">Shipping Fee</span>
                 <div className="flex items-center gap-2">
                   <span>RM</span>
                   <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} className="w-20 bg-transparent border-b border-white/30 text-right outline-none font-bold focus:border-white" />
                 </div>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-white/10">
                 <span className="text-sm font-bold uppercase">Grand Total</span>
                 <span className="text-3xl font-black text-indigo-400">
                   RM {(Number(formData.totalAmount) || 0).toFixed(2)}
                 </span>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={formData.orderPackages.length === 0} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {order.isNew ? "Create Order" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEditModal;