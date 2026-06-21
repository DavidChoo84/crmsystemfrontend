import React, { useState, useEffect, useRef } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faSave, faTrash, faUserCheck, faTruck, faUserPlus, faCreditCard, faUserTie, faClipboardList, faBullhorn
} from "@fortawesome/free-solid-svg-icons";

// IMPORT CUSTOMER EDIT MODAL
import CustomerEditModal from "./CustomerEditModal"; 

const OrderEditModal = ({ order, viewMode = "orders", onClose, onSave }) => {
  const [nextId, setNextId] = useState("");
  const [availablePackages, setAvailablePackages] = useState([]);
  
  // STATE TO CONTROL CUSTOMER MODAL VISIBILITY
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  // Track the current order to prevent state resets while typing
  const initializedOrderId = useRef(null);

  // --- CONFIGURATION FLAGS FOR LOGISTIC VIEW ---
  const lockOrderFields = viewMode === "logistic";     
  const lockLogisticsFields = viewMode !== "logistic"; 

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
    customerId: order.customerId || order.customer?.customerId || "",
    customerName: order.customerName || order.customer?.name || "",
    address: order.address || order.customer?.address || "",
    orderDate: formatLocalDate(order.orderDate),
    shippingFee: Number(order.shippingFee) || 0,
    totalAmount: Number(order.totalAmount) || 0,
    orderPackages: order.orderPackages || [],
    courierCompany: order.courierCompany || "",
    trackingNumber: order.trackingNumber || "" ,
    paymentType: order.paymentType || "Transfer",
    paymentStatus: order.paymentStatus || "Unpaid",
    salesperson: order.salesPerson || order.salesperson || "",
    status: order.status || "Pending",
    channel: order.channel || "Facebook",
    receiptImage: order.receiptImage || ""
  });

  // --- 2. EFFECTS ---

  // Sync state if a different order is selected (or when modal opens)
  useEffect(() => {
    const currentId = order.orderId || "new-order";
    if (order && currentId !== initializedOrderId.current) {
      setFormData({
        ...order,
        orderId: order.orderId || "",
        customerId: order.customerId || order.customer?.customerId || "",
        customerName: order.customerName || order.customer?.name || "",
        address: order.address || order.customer?.address || "",
        orderDate: formatLocalDate(order.orderDate),
        orderPackages: order.orderPackages || [],
        shippingFee: Number(order.shippingFee) || 0,
        totalAmount: Number(order.totalAmount) || 0,
        courierCompany: order.courierCompany || "",
        trackingNumber: order.trackingNumber || "",
        paymentType: order.paymentType || "Transfer",
        paymentStatus: order.paymentStatus || "Unpaid",
        salesPerson: order.salesPerson || "",
        status: order.status || "Pending",
        channel: order.channel || "Facebook",
        receiptImage: order.receiptImage || ""
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please choose an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        receiptImage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
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
    // 🔑 FIXED: Custom packages require an empty placeholder item object so NestJS transaction doesn't crash on null properties
    setFormData(prev => ({ 
      ...prev, 
      orderPackages: [
        ...prev.orderPackages, 
        { 
          packageName: "", 
          packagePrice: 0, 
          quantity: 1, 
          orderProducts: [{ productId: "CUSTOM_ITEM", productName: "Custom Item", quantity: 1 }] 
        }
      ] 
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
        address: customer.address || "",
      }));
    }
  };

  const handleNewCustomerSaved = (savedCustomer) => {
    if (savedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId: savedCustomer.customerId,
        customerName: savedCustomer.name,
        address: savedCustomer.address || ""
      }));
    }
    setIsCustomerModalOpen(false);
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
  const inputStyle = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white";
  const readOnlyStyle = "w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-400 cursor-not-allowed";
  const labelStyle = "block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-indigo-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white">
            {order.isNew ? "✨ New Order" : `Order #${order.orderId}`} 
            {viewMode === "logistic" && <span className="text-xs bg-amber-500 text-slate-900 ml-2 px-2 py-0.5 rounded font-black">LOGISTIC MODE</span>}
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
              <input 
                type="datetime-local" 
                name="orderDate" 
                value={formData.orderDate} 
                onChange={handleChange} 
                disabled={lockOrderFields} 
                className={lockOrderFields ? readOnlyStyle : inputStyle} 
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}><FontAwesomeIcon icon={faUserCheck} className="mr-1"/> Customer</label>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <AsyncSelect 
                    cacheOptions defaultOptions
                    loadOptions={loadCustomerOptions}
                    onChange={handleCustomerSelect}
                    placeholder="Search customer..."
                    isDisabled={lockOrderFields}
                    value={formData.customerId ? { label: formData.customerName, value: formData.customerId } : null}
                    styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', minHeight: '42px', backgroundColor: lockOrderFields ? '#f3f4f6' : '#fff' }) }}
                  />
                </div>
                
                {!lockOrderFields && (
                  <button 
                    type="button" 
                    onClick={() => setIsCustomerModalOpen(true)} 
                    className="px-3.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 active:scale-95 transition flex items-center justify-center gap-1.5 text-sm h-[42px]"
                    title="Add New Customer"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span className="hidden sm:inline">New</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 1.5: Payment Metadata, Status, Channel & Staff Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className={labelStyle}><FontAwesomeIcon icon={faCreditCard} className="mr-1" /> Payment Type</label>
              <select name="paymentType" value={formData.paymentType} onChange={handleChange} disabled={lockOrderFields} className={lockOrderFields ? readOnlyStyle : inputStyle}>
                <option value="Transfer">Bank Transfer</option>
                <option value="TNG">Touch 'n Go eWallet</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Payment Status</label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} disabled={lockOrderFields} className={lockOrderFields ? readOnlyStyle : inputStyle}>
                <option value="Unpaid">❌ Unpaid</option>
                <option value="Paid">✅ Paid</option>
                <option value="Partially Paid">⚠️ Partially Paid</option>
                <option value="Refunded">🔄 Refunded</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}><FontAwesomeIcon icon={faClipboardList} className="mr-1" /> Order Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputStyle}>
                <option value="Pending">⏳ Pending</option>
                <option value="Processing">⚙️ Processing</option>
                <option value="Shipped">📦 Shipped</option>
                <option value="Completed">✅ Completed</option>
                <option value="Cancelled">❌ Cancelled</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}><FontAwesomeIcon icon={faBullhorn} className="mr-1" /> Channel</label>
              <select name="channel" value={formData.channel} onChange={handleChange} disabled={lockOrderFields} className={lockOrderFields ? readOnlyStyle : inputStyle}>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok Shop</option>
                <option value="Website">Website</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}><FontAwesomeIcon icon={faUserTie} className="mr-1" /> Salesperson</label>
              <input type="text" name="salesPerson" value={formData.salesPerson} onChange={handleChange} disabled={lockOrderFields} placeholder="Enter name or ID" className={lockOrderFields ? readOnlyStyle : inputStyle} />
            </div>
          </div>

          {/* Section 2: Packages */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Order Items</h4>
              {!lockOrderFields && (
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
              )}
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
                      <input type="text" value={pkg.packageName} onChange={(e) => handlePackageChange(index, "packageName", e.target.value)} disabled={lockOrderFields} className={lockOrderFields ? readOnlyStyle : inputStyle} placeholder="Enter name..." />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Price (RM)</label>
                      <input type="number" value={pkg.packagePrice} onChange={(e) => handlePackageChange(index, "packagePrice", e.target.value)} disabled={lockOrderFields} className={lockOrderFields ? readOnlyStyle : inputStyle} />
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                      <input type="number" value={pkg.quantity} onChange={(e) => handlePackageChange(index, "quantity", e.target.value)} disabled={lockOrderFields} className={lockOrderFields ? readOnlyStyle : inputStyle} />
                    </div>
                    {!lockOrderFields && (
                      <button type="button" onClick={() => removePackage(index)} className="p-2.5 text-gray-400 hover:text-red-500 transition">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
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
                 {lockLogisticsFields && <span className="text-[10px] font-normal lowercase tracking-normal text-gray-400"> (Read-Only)</span>}
               </h4>
               <input 
                 type="text" 
                 name="courierCompany" 
                 value={formData.courierCompany} 
                 onChange={handleChange}
                 disabled={lockLogisticsFields} 
                 placeholder={lockLogisticsFields ? "No Courier Assigned Yet" : "Enter Courier Company"} 
                 className={lockLogisticsFields ? readOnlyStyle : inputStyle} 
               />
               <input 
                 type="text" 
                 name="trackingNumber" 
                 value={formData.trackingNumber} 
                 onChange={handleChange}
                 disabled={lockLogisticsFields} 
                 placeholder={lockLogisticsFields ? "No Tracking ID Available" : "Enter Tracking Number"} 
                 className={lockLogisticsFields ? readOnlyStyle : inputStyle} 
               />
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
               <div className="flex justify-between items-center mb-4 opacity-80">
                 <span className="text-xs font-bold uppercase">Shipping Fee</span>
                 <div className="flex items-center gap-2">
                   <span>RM</span>
                   <input 
                     type="number" 
                     name="shippingFee" 
                     value={formData.shippingFee} 
                     onChange={handleChange} 
                     disabled={lockOrderFields}
                     className={`w-20 bg-transparent text-right outline-none font-bold focus:border-white ${lockOrderFields ? "text-gray-500 cursor-not-allowed" : "border-b border-white/30"}`} 
                   />
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
          
          {/* Receipt Upload Control Module */}
          <div className="mt-6 border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction Receipt / Proof of Payment
            </label>
            
            <div className="flex items-center gap-4">
              {!lockOrderFields ? (
                <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition">
                  Choose File
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
              ) : (
                <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 font-medium">Locked in Logistic View</span>
              )}
              
              <span className="text-xs text-gray-400">
                {formData.receiptImage ? "Image processed successfully" : "No file uploaded yet (JPEG, PNG)"}
              </span>
            </div>

            {/* Live Document Render View Container */}
            {formData.receiptImage && (
              <div className="mt-4 p-2 bg-gray-100 rounded-lg inline-block relative border">
                <img 
                  src={formData.receiptImage} 
                  alt="Receipt Preview" 
                  className="max-h-40 rounded object-contain shadow-sm"
                />
                {!lockOrderFields && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, receiptImage: "" }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
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

      {/* CONDITIONALLY RENDER THE CUSTOMER EDIT MODAL OVERLAY */}
      {isCustomerModalOpen && (
        <CustomerEditModal 
          customer={{ isNew: true }} 
          onClose={() => setIsCustomerModalOpen(false)} 
          onSave={handleNewCustomerSaved} 
        />
      )}
    </div>
  );
};

export default OrderEditModal;