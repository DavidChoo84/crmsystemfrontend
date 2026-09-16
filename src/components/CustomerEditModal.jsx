import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faContactCard, faChartLine, faCrown, 
  faMapMarkerAlt, faCakeCandles, faShareNodes 
} from "@fortawesome/free-solid-svg-icons";

const CustomerEditModal = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    email: "",
    mobilePhone: "",
    fbName: "", // NEW
    dateOfBirth: "", // NEW
    address: "", // NEW
    postCode: "", // NEW
    city: "", // NEW
    state: "", // NEW
    totalOrder: 0,
    totalSpent: 0,
    lastOrderDate: "",
    privilege: "Premium",
    isNew: false,
  });

  useEffect(() => {
    if (customer) {
      // 🔧 FIX: merge with previous state instead of replacing it outright —
      // otherwise any field missing from the incoming `customer` object
      // (e.g. fbName, address, postCode, city, state, or customerId when
      // opened from OrderEditModal) collapses to `undefined` instead of
      // keeping its sensible default.
      setFormData((prev) => ({
        ...prev,
        ...customer,
        isNew: customer.isNew || false,
        // Format dates for HTML input types
        lastOrderDate: customer.lastOrderDate 
          ? new Date(customer.lastOrderDate).toISOString().split('T')[0] 
          : "",
        dateOfBirth: customer.dateOfBirth 
          ? new Date(customer.dateOfBirth).toISOString().split('T')[0] 
          : ""
      }));
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // VALIDATION: Postcode must be numeric and max 5 digits
    if (name === "postCode") {
      const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
      if (numericValue.length <= 5) {
        setFormData((prev) => ({ ...prev, postCode: numericValue }));
      }
      return; // Stop here so it doesn't run the generic setter below
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 2. Final check before submission
    if (formData.postCode && formData.postCode.length !== 5) {
      alert("Please enter a valid 5-digit postcode.");
      return;
    }

    if (formData.isNew && !formData.customerId) {
      alert("Missing customer ID — please close and reopen this form.");
      return;
    }
    
    const payload = {
      ...formData,
      totalOrder: parseInt(formData.totalOrder) || 0,
      totalSpent: parseFloat(formData.totalSpent) || 0,
    };
    onSave(payload);
  };

  const getPrivilegeColor = (level) => {
    if (level === "VVIP") return "text-purple-600 bg-purple-50 border-purple-200";
    if (level === "VIP") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-tight";
  const inputClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm";

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-8 relative text-gray-800 max-h-[95vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-2xl transition">&times;</button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-blue-600" />
          {formData.isNew ? "Add New Customer" : "Edit Customer Profile"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMN 1: PERSONAL & SOCIAL */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faContactCard} /> Personal Details
            </h3>
            
            <div>
              <label className={labelClass}>Customer ID</label>
              <input type="text" value={formData.customerId} readOnly className="w-full mt-1 px-3 py-2 bg-gray-100 border rounded-lg text-sm text-gray-600 font-mono" />
            </div>

            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className={labelClass}>Birthday</label>
                  <div className="relative">
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
                  </div>
               </div>
               <div>
                  <label className={labelClass}>FB Name</label>
                  <input type="text" name="fbName" value={formData.fbName} onChange={handleChange} placeholder="Username" className={inputClass} />
               </div>
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Mobile Phone</label>
              <input type="tel" name="mobilePhone" value={formData.mobilePhone} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* COLUMN 2: LOCATION DETAILS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Address & Location
            </h3>
            
            <div>
              <label className={labelClass}>Full Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className={`${inputClass} resize-none`} placeholder="Street address, unit number..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Postcode</label>
                <input type="text" name="postCode" value={formData.postCode} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>State</label>
              <select name="state" value={formData.state} onChange={handleChange} className={inputClass}>
                <option value="">Select State</option>
                <option value="Johor">Johor</option>
                <option value="Kedah">Kedah</option>
                <option value="Kelantan">Kelantan</option>
                <option value="Melaka">Melaka</option>
                <option value="Negeri Sembilan">Negeri Sembilan</option>
                <option value="Pahang">Pahang</option>
                <option value="Perak">Perak</option>
                <option value="Perlis">Perlis</option>
                <option value="Pulau Pinang">Pulau Pinang</option>
                <option value="Sabah">Sabah</option>
                <option value="Sarawak">Sarawak</option>
                <option value="Selangor">Selangor</option>
                <option value="Terengganu">Terengganu</option>
                <option value="W.P. Kuala Lumpur">W.P. Kuala Lumpur</option>
              </select>
            </div>
          </div>

          {/* COLUMN 3: ACCOUNT & SUMMARY */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} /> Loyalty & Status
            </h3>

            <div>
              <label className={labelClass}>Privilege Level</label>
              <select name="privilege" value={formData.privilege} onChange={handleChange} className={`w-full mt-1 px-3 py-2 border rounded-lg outline-none font-bold transition ${getPrivilegeColor(formData.privilege)}`}>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
                <option value="VVIP">VVIP</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Total Orders</label>
                <input type="number" name="totalOrder" value={formData.totalOrder} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Total Spent</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm font-semibold">RM</span>
                  <input type="number" step="0.01" name="totalSpent" value={formData.totalSpent} onChange={handleChange} className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" />
                </div>
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
               <p className="text-[10px] text-blue-600 font-bold uppercase mb-2">Customer Summary</p>
               <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xl font-bold text-blue-900">RM {parseFloat(formData.totalSpent || 0).toLocaleString()}</span>
                    <p className="text-[9px] text-blue-400 font-medium">LIFETIME VALUE (LTV)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-800">{formData.totalOrder || 0}</span>
                    <p className="text-[9px] text-blue-400 font-medium">VISITS</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t pt-6">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition">Cancel</button>
          <button type="submit" className="px-10 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition">
            {formData.isNew ? "Create Customer" : "Update Profile"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default CustomerEditModal;