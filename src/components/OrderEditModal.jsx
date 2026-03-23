import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faSave, faPlus, faTrash, faBoxOpen, faFileInvoiceDollar, 
  faMagicWandSparkles, faUserCheck, faUserPlus, faInfoCircle, faTruck 
} from "@fortawesome/free-solid-svg-icons";
import { components } from 'react-select';


const OrderEditModal = ({ order, onClose, onSave }) => {
  const [nextId, setNextId] = useState("");
  const [availablePackages, setAvailablePackages] = useState([]);

  // --- 1. STATE DEFINITION WITH DB DEFAULTS ---
  const [formData, setFormData] = useState({
    ...order,
    orderId: order.orderId || "",
    customerId: order.customerId || "",
    orderDate: order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    customerName: order.customerName || "",
    fbName: order.fbName || "",
    email: order.email || "",
    contactNumber: order.contactNumber || "",
    address: order.address || "",
    dateOfBirth: order.dateOfBirth ? new Date(order.dateOfBirth).toISOString().slice(0, 10) : "",
    postCode: order.postCode || "",
    city: order.city || "",
    state: order.state || "",
    // Enums & Defaults
    channel: order.channel || "Whatsapp",
    orderType: order.orderType || "New",
    paymentType: order.paymentType || "Transfer",
    paymentStatus: order.paymentStatus || "Pending",
    status: order.status || "Pending",
    // Logistics
    salesPerson: order.salesPerson || "",
    courierCompany: order.courierCompany || "",
    trackingNumber: order.trackingNumber || "",
    shippingFee: order.shippingFee || 0,
    totalAmount: order.totalAmount || 0,
    remark: order.remark || "",
    orderPackages: order.orderPackages || []
  });

  useEffect(() => {
    if (order.isNew) {
      axios.get("http://localhost:3000/orders/next-id")
        .then(res => setNextId(res.data.nextId))
        .catch(err => console.error("Error fetching next ID", err));
    }
  }, [order.isNew]);

  // --- 2. HANDLERS ---
  const handleCustomerSelect = (selectedOption) => {
    if (selectedOption) {
      const { customer } = selectedOption;
      setFormData(prev => ({
        ...prev,
        customerId: customer.customerId,
        customerName: customer.name,
        contactNumber: customer.mobilePhone || customer.contactNumber || "",
        email: customer.email || "",
        address: customer.address || "",
        postCode: customer.postCode || "",
        state: customer.state || "",
        fbName: customer.fbName || "",
        dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().slice(0, 10) : "",
        city: customer.city || ""
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- 3. UI STYLES ---
  const inputStyle = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const readOnlyStyle = "w-full bg-[#f3f4f6] border-none rounded-lg px-4 py-3 text-sm font-mono text-gray-500 focus:ring-0 cursor-not-allowed";
  const labelStyle = "block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider";

  // --- 4. CUSTOMER SEARCH LOGIC ---
  const loadCustomerOptions = async (inputValue) => {
    // 1. Determine URL: Search by name if typing, otherwise fetch general list
    const url = inputValue.length > 0 
      ? `http://localhost:3000/customers/search?q=${inputValue}`
      : `http://localhost:3000/customers`;

    try {
      const res = await axios.get(url);
    
      // 2. Map the database results into the format React-Select expects
      // We include the full 'customer' object so we can auto-fill the address/email later
      return res.data.map(c => ({
        value: c.customerId,
        label: `${c.name} (${c.customerId})`,
        customer: c 
      }));
    } catch (err) {
      console.error("Fetch error:", err);
      return []; // Return empty array so the UI doesn't crash on error
    }
  };

  const NoOptionsMessage = (props) => (
    <components.NoOptionsMessage {...props}>
      <span className="text-sm text-gray-400">No customers found</span>
    </components.NoOptionsMessage>
  );

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
      boxShadow: 'none',
      '&:hover': { borderColor: '#6366f1' },
      fontSize: '0.875rem',
      padding: '2px'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
      color: '#374151',
      cursor: 'pointer'
    })
  };

  // --- 4. PACKAGE LOGIC ---
  useEffect(() => {
    const fetchTemplates = async () => {
    try {
      const res = await fetch("http://localhost:3000/packages");
      const data = await res.json();
      setAvailablePackages(data);
    } catch (err) {
        console.error("Failed to fetch templates", err);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const pkgTotal = formData.orderPackages.reduce((sum, pkg) => 
      sum + (Number(pkg.packagePrice) * Number(pkg.quantity)), 0);
    setFormData(prev => ({ ...prev, totalAmount: pkgTotal + Number(formData.shippingFee) }));
  }, [formData.orderPackages, formData.shippingFee]);

  const handleAddFromTemplate = (e) => {
    const templateId = e.target.value;
    if (!templateId) return;
      const template = availablePackages.find(p => p.packageId === templateId);
    if (!template) return;

    const newPkg = {
      packageName: template.packageName,
      packagePrice: template.sellingPrice,
      quantity: 1,
      orderProducts: template.packageProducts?.map(pp => ({
      productName: pp.product?.productName || "Unknown",
      unitCost: pp.product?.costPrice || 0,
      quantity: pp.quantity
      })) || []
    };
    setFormData(prev => ({ ...prev, orderPackages: [...prev.orderPackages, newPkg] }));
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

  const handlePackageChange = (index, field, value) => {
    const updated = [...formData.orderPackages];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, orderPackages: updated }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-indigo-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {order.isNew ? "✨ Create New Order" : `📝 Edit Order #${order.orderId}`}
          </h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 overflow-y-auto space-y-10">
          
          {/* SECTION: CUSTOMER INFORMATION */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-1">
               <h4 className="text-indigo-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                 <FontAwesomeIcon icon={faUserCheck} /> Customer & Core Info
               </h4>
               <button type="button" onClick={() => window.open("/customers", "_blank")} className="text-[10px] text-indigo-500 hover:underline font-bold">
                 <FontAwesomeIcon icon={faUserPlus} className="mr-1" /> New Customer?
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelStyle}>Order ID</label>
                <input type="text" value={order.isNew ? nextId : formData.orderId} readOnly className={readOnlyStyle} />
              </div>
              <div>
                <label className={labelStyle}>Order Date</label>
                <input type="datetime-local" name="orderDate" value={formData.orderDate} onChange={handleChange} className={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Search Customer Name</label>
                <AsyncSelect 
                  cacheOptions 
                  defaultOptions={true}
                  loadOptions={loadCustomerOptions}
                  onChange={handleCustomerSelect}
                  placeholder="Select or search customer..."
                  components={{ NoOptionsMessage }}
                  styles={{
                    ...customSelectStyles,
                    // This part makes it scrollable
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '200px', // Limits height to roughly 5 items
                      overflowY: 'auto'    // Enables the scrollbar
                    })
                  }}  
                  className="text-sm"
                  value={formData.customerId ? { label: formData.customerName, value: formData.customerId } : null}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyle}>Customer ID</label>
                <input type="text" value={formData.customerId} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
              </div>
              <div>
                <label className={labelStyle}>Email</label>
                <input type="text" value={formData.email} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
              </div>
              <div>
                <label className={labelStyle}>Facebook Name</label>
                <input type="text" value={formData.fbName} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
              </div>
              <div>
                <label className={labelStyle}>Date of Birth</label>
                <input type="text" value={formData.dateOfBirth} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
              </div>
              <div>
                <label className={labelStyle}>Contact Number</label>
                <input type="text" value={formData.contactNumber} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
              </div>
            </div>
          </div>

          {/* SECTION: ORDER METADATA (DB ENUMS) */}
          <div className="space-y-6">
            <div className="flex justify-between items-center bordxer-b pb-1">
               <h4 className="text-indigo-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                 <FontAwesomeIcon icon={faInfoCircle} /> Order Details
               </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelStyle}>Channel</label>
                <select name="channel" value={formData.channel} onChange={handleChange} className={inputStyle}>
                  <option value="Whatsapp">Whatsapp</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Tiktok">Tiktok</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Order Type</label>
                <select name="orderType" value={formData.orderType} onChange={handleChange} className={inputStyle}>
                  <option value="New">New</option>
                  <option value="Repeat">Repeat</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Payment Method</label>
                <select name="paymentType" value={formData.paymentType} onChange={handleChange} className={inputStyle}>
                  <option value="Transfer">Transfer</option>
                  <option value="COD">COD</option>
                  <option value="TNG">TNG</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Sales Person</label>
                <input type="text" name="salesPerson" value={formData.salesPerson} onChange={handleChange} className={inputStyle} placeholder="Staff Name" />
              </div>
            </div>
          </div>

          {/* Package Items Section (Existing logic) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-1">
            <h4 className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Order Packages</h4>
              <div className="flex items-center gap-3">
                <div className="relative">
                <select onChange={handleAddFromTemplate} className="text-xs border rounded-full px-4 py-1.5 bg-indigo-50 text-indigo-700 font-bold outline-none border-indigo-200 hover:bg-indigo-100 transition cursor-pointer appearance-none pr-8">
                <option value="">+ Add From Template</option>
                {availablePackages.map(p => (
                <option key={p.packageId} value={p.packageId}>{p.packageName} (RM {p.sellingPrice})</option>
                ))}
                </select>
                <FontAwesomeIcon icon={faMagicWandSparkles} className="absolute right-3 top-2 text-indigo-400 pointer-events-none" />
                </div>
                <button type="button" onClick={addBlankPackage} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition font-bold">
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Custom
                </button>
              </div>
            </div>
            <div className="space-y-3">
            {formData.orderPackages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-gray-400 text-sm bg-gray-50">
            <FontAwesomeIcon icon={faBoxOpen} size="2x" className="mb-2 block mx-auto opacity-20" />
            No packages added yet.
            </div>
            ) : (
            formData.orderPackages.map((pkg, index) => (
              <div key={index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Package Name</label>
                  <input type="text" value={pkg.packageName} onChange={(e) => handlePackageChange(index, "packageName", e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 outline-none" />
                </div>
                <div className="w-28">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Price (RM)</label>
                  <input type="number" value={pkg.packagePrice} onChange={(e) => handlePackageChange(index, "packagePrice", e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-right font-medium focus:ring-1 focus:ring-indigo-400 outline-none" />
                </div>
                <div className="w-20">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Qty</label>
                  <input type="number" value={pkg.quantity} onChange={(e) => handlePackageChange(index, "quantity", e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-center focus:ring-1 focus:ring-indigo-400 outline-none" />
                </div>
              <button type="button" onClick={() => removePackage(index)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              <FontAwesomeIcon icon={faTrash} />
              </button>
              </div>
              ))
            )}
            </div>
          </div>

          {/* SECTION: LOGISTICS & ADDRESS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-1">
               <h4 className="text-indigo-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                 <FontAwesomeIcon icon={faTruck} /> Logistics & Shipping
               </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Full Address</label>
                  <textarea name="address" value={formData.address} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Postcode</label>
                    <input type="text" name="postCode" value={formData.postCode} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
                  </div>
                  <div>
                    <label className={labelStyle}>City</label>
                    <input type="text" name="city" value={formData.city} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
                  </div>
                  <div>
                    <label className={labelStyle}>State</label>
                    <input type="text" name="state" value={formData.state} readOnly className={readOnlyStyle} placeholder="Auto-filled" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Courier Company</label>
                  <input type="text" name="courierCompany" value={formData.courierCompany} onChange={handleChange} className={inputStyle} placeholder="e.g. J&T Express" />
                </div>
                <div>
                  <label className={labelStyle}>Tracking Number</label>
                  <input type="text" name="trackingNumber" value={formData.trackingNumber} onChange={handleChange} className={inputStyle} placeholder="Tracking ID" />
                </div>
                <div>
                  <label className={labelStyle}>Remark</label>
                  <input type="text" name="remark" value={formData.remark} onChange={handleChange} className={inputStyle} placeholder="Internal notes..." />
                </div>
              </div>
            </div>
          </div>
          {/* Billing & Grand Total Section */}
          <div className="flex justify-end pt-4 border-t">
            <div className="bg-indigo-900 text-white p-6 rounded-2xl w-full md:w-80 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <FontAwesomeIcon icon={faFileInvoiceDollar} size="4x" />
               </div>
               <div className="flex justify-between items-center opacity-70 mb-1 relative z-10">
                 <span className="text-xs font-bold uppercase">Shipping Fee</span>
                 <div className="flex items-center">
                   <span className="text-xs mr-1">RM</span>
                   <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} className="w-16 bg-transparent border-b border-white border-opacity-30 text-right outline-none font-bold" />
                 </div>
               </div>
               <div className="flex justify-between items-center mt-3 border-t border-white border-opacity-20 pt-3 relative z-10">
                 <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
                 <span className="text-3xl font-black">RM {Number(formData.totalAmount).toFixed(2)}</span>
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-500 font-bold hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" className="flex items-center gap-2 px-10 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg active:scale-95 transition">
              <FontAwesomeIcon icon={faSave} />
              {order.isNew ? "Create Order" : "Update Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEditModal;

