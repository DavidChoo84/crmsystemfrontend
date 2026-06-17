import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash, faPlus, faFilter, faUndo } from "@fortawesome/free-solid-svg-icons";

// Assuming you have created these similar to your Product modals
import CustomerDetailModal from "../components/CustomerDetailModal";
import CustomerEditModal from "../components/CustomerEditModal";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  
  // Selection States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete modal states
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Animation trigger
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // DOM render

  // 🚨 NEW FILTER STATES
  const [filterExactDate, setFilterExactDate] = useState(""); // Format: YYYY-MM-DD
  const [filterMonth, setFilterMonth] = useState(""); // Format: "01" through "12"

  // Notification
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), duration);
  };

  // 1. Fetch Customers
  const fetchCustomers = async () => {
    try {
      console.log("🔍 Fetching Customers...");
      const res = await fetch("http://localhost:3000/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      
      const data = await res.json();
      console.log("   Fetched Customers:", data);

      // Sort by ID (C001, C002...)
      setCustomers(data.sort((a, b) => a.customerId.localeCompare(b.customerId)));
    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      showNotification("Failed to fetch data", "error");
    }
  };

  // 2. Add Customer (Pre-fetch ID)
  const handleAdd = async () => {
    try {
      const res = await fetch("http://localhost:3000/customers/next-id"); 
      let nextId = "C???";
      if (res.ok) {
        const data = await res.json();
        nextId = data.nextId || data;
      }

      setEditCustomer({
        isNew: true,
        customerId: nextId, 
        name: "",
        email: "",
        mobilePhone: "",
        totalOrder: 0,
        totalSpent: 0,
        privilege: "Premium",
        dateOfBirth: "", // Added explicit blank field default
      });

      setShowEditModal(true);
    } catch (err) {
      console.error("Error preparing add:", err);
      showNotification("Failed to prepare adding customer", "error");
    }
  };

  // 3. Edit Customer
  const handleEdit = (customer) => {
    setEditCustomer({ ...customer, isNew: false });
    setShowEditModal(true);
  };

  // 4. Save Logic
  const handleSaveCustomer = async (updatedCustomer) => {
    try {
      const isUpdate = !updatedCustomer.isNew;
      const url = isUpdate
        ? `http://localhost:3000/customers/${updatedCustomer.customerId}`
        : `http://localhost:3000/customers`;
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCustomer),
      });

      if (!res.ok) throw new Error("Failed to save customer");

      const saved = await res.json();

      setCustomers((prev) =>
        isUpdate
          ? prev.map((c) => (c.customerId === saved.customerId ? saved : c))
          : [...prev, saved]
      );

      showNotification(
        isUpdate ? "Customer updated successfully!" : "Customer added successfully!",
        "success"
      );

      setShowEditModal(false);
      setEditCustomer(null);
    } catch (err) {
      console.error("Error saving customer:", err);
      showNotification("Failed to save customer", "error");
    }
  };

  // 5. Delete Logic
  const confirmDelete = (customer) => {
    setDeleteCustomer(customer);
    setDeleteModalVisible(true);
    setTimeout(() => setShowDeleteModal(true), 10);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setDeleteModalVisible(false);
      setDeleteCustomer(null);
    }, 300);
  };

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    try {
      const res = await fetch(
        `http://localhost:3000/customers/${deleteCustomer.customerId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete customer");

      setCustomers((prev) =>
        prev.filter((c) => c.customerId !== deleteCustomer.customerId)
      );

      showNotification("Customer deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting customer:", err);
      showNotification("Failed to delete customer", "error");
    } finally {
      closeDeleteModal();
    }
  };

  // 🚨 6. COMPUTE FILTERED CUSTOMERS LIST
  const filteredCustomers = customers.filter((c) => {
    if (!c.dateOfBirth) {
      // If a filter is active but customer has no DOB, hide them
      return !filterExactDate && !filterMonth;
    }

    const birthDate = new Date(c.dateOfBirth);
    if (isNaN(birthDate.getTime())) return false; // Guard against broken dates

    // Exact Date Condition check (matches YYYY-MM-DD format)
    if (filterExactDate) {
      const targetIso = birthDate.toISOString().split("T")[0];
      if (targetIso !== filterExactDate) return false;
    }

    // Month Condition check (matches "01" through "12")
    if (filterMonth) {
      const customerMonth = (birthDate.getMonth() + 1).toString().padStart(2, "0");
      if (customerMonth !== filterMonth) return false;
    }

    return true;
  });

  // Reset helper
  const handleClearFilters = () => {
    setFilterExactDate("");
    setFilterMonth("");
  };

  // Helper for Privilege Color
  const getPrivilegeColor = (p) => {
    if (p === 'VVIP') return 'text-purple-600 bg-purple-100';
    if (p === 'VIP') return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="flex gap-6 relative">
      {/* Notification Toast */}
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
            Customer Management
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Customer
          </button>
        </div>

        {/* 🚨 NEW: FILTERS CONTROL BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
              <FontAwesomeIcon icon={faFilter} className="text-blue-500" /> Filter Birthday:
            </div>

            {/* Month Dropdown Filter */}
            <div className="flex flex-col">
              <select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setFilterExactDate(""); // clear exact date if shifting to month mode
                }}
                className="px-3 py-1.5 rounded-lg border bg-gray-50 text-sm focus:outline-blue-500"
              >
                <option value="">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Exact HTML5 Date Input Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Or Specific Date:</span>
              <input
                type="date"
                value={filterExactDate}
                onChange={(e) => {
                  setFilterExactDate(e.target.value);
                  setFilterMonth(""); // clear month option if targeting explicit day
                }}
                className="px-3 py-1 rounded-lg border bg-gray-50 text-sm focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Reset Action Trigger */}
          {(filterExactDate || filterMonth) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600 transition flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faUndo} /> Reset Filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Date of Birth</th> {/* 🚨 Added Header column */}
                <th className="py-3 px-4">Total Order</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Privilege</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {/* 🚨 SWAPPED: loop over filteredCustomers instead of raw customers */}
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.customerId}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-gray-600">{c.customerId}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.mobilePhone}</div>
                    </td>
                    <td className="py-3 px-4">{c.email}</td>
                    
                    {/* 🚨 Added Table Row Display Data */}
                    <td className="py-3 px-4 text-sm font-medium text-gray-600">
                      {c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString() : (
                        <span className="text-gray-300 italic text-xs">Not Set</span>
                      )}
                    </td>

                    <td className="py-3 px-4">{c.totalOrder}</td>
                    <td className="py-3 px-4 font-medium">
                       RM {Number(c.totalSpent).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPrivilegeColor(c.privilege)}`}>
                        {c.privilege}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <FontAwesomeIcon icon={faEye} className="text-yellow-600" />
                        </button>

                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => handleEdit(c)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-blue-600" />
                        </button>

                        <button
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() => confirmDelete(c)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No matching customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedCustomer && (
         <CustomerDetailModal 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)} 
         />
      )}

      {/* Edit/Add Modal */}
      {showEditModal && editCustomer && (
        <CustomerEditModal
          customer={editCustomer}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveCustomer}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && deleteCustomer && (
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
                {deleteCustomer.name}
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

export default CustomerList;