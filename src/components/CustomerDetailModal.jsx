import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs"; // Highly recommended for date formatting

const CustomerDetailModal = ({ customer, onClose }) => {
  if (!customer) return null;

  // Helper to check if a value should be displayed
  const show = (val) => val !== null && val !== undefined && val !== "";

  // Helper for currency formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount || 0);
  };

  // Helper for date formatting
  const formatDate = (date) => {
    return date ? dayjs(date).format("DD MMM YYYY") : "No orders yet";
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 pb-6 relative text-gray-800 max-h-[85vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-2xl transition-colors"
          >
            &times;
          </button>

          <h2 className="text-2xl font-semibold text-center mb-6">
            Customer Profile
          </h2>

          {/* SCROLLABLE CONTENT */}
          <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "60vh" }}>
            <div className="grid grid-cols-2 gap-4 pb-4">
              
              {/* Primary Info */}
              {show(customer.customerId) && <Detail label="Customer ID" value={customer.customerId} />}
              {show(customer.privilege) && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Privilege</span>
                  <span className={`px-3 py-2 font-bold rounded-full text-center text-sm ${getPrivilegeStyle(customer.privilege)}`}>
                    {customer.privilege}
                  </span>
                </div>
              )}

              {/* Contact Info - Full Width */}
              <div className="col-span-2 mt-2">
                 <hr className="border-gray-100 mb-4" />
              </div>

              {show(customer.name) && <Detail label="Full Name" value={customer.name} className="col-span-2" />}
              {show(customer.email) && <Detail label="Email Address" value={customer.email} className="col-span-2" />}
              {show(customer.mobilePhone) && <Detail label="Mobile Phone" value={customer.mobilePhone} />}
              {show(customer.dateOfBirth) && <Detail label="Date of Birth" value={customer.dateOfBirth} />}
              
              {/* Address Metrics */}
              <div className="col-span-2 mt-2">
                 <hr className="border-gray-100 mb-4" />
              </div>
              {show(customer.address) && <Detail label="Address" value={customer.address} className="col-span-2" />}
              {show(customer.postCode) && <Detail label="Postcode" value={customer.postCode}/>}
              {show(customer.city) && <Detail label="City" value={customer.city} />}
              {show(customer.state) && <Detail label="State" value={customer.state} />}

              {/* Sales Metrics */}
              <div className="col-span-2 mt-2">
                 <hr className="border-gray-100 mb-4" />
              </div>

              {show(customer.totalOrder) && <Detail label="Total Orders" value={customer.totalOrder} />}
              {<Detail label="Total Spent" value={formatCurrency(customer.totalSpent)} />}
              
              {show(customer.lastOrderDate) && (
                <Detail label="Last Order Date" value={formatDate(customer.lastOrderDate)} className="col-span-2" />
              )}

            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* 💙 Reusable "pill" visual component */
const Detail = ({ label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">{label}</span>
    <span className="px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-100 break-words">
      {value}
    </span>
  </div>
);

/* ✨ Helper for Privilege Colors */
const getPrivilegeStyle = (level) => {
  switch (level) {
    case "VVIP":
      return "bg-purple-100 text-purple-700 border border-purple-200";
    case "VIP":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    default:
      return "bg-blue-100 text-blue-700 border border-blue-200";
  }
};

export default CustomerDetailModal;