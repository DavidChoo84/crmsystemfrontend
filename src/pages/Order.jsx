import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash, faPlus, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import OrderDetailModal from "../components/OrderDetailModal";
import OrderEditModal from "../components/OrderEditModal";

const Order = () => {
  const [orders, setOrders] = useState([]);
  
  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete Modal States
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Notification
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchOrders();
  }, []);

  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), duration);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:3000/orders");
      const data = await res.json();
      // Sort by Created Date (Newest first)
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showNotification("Failed to fetch orders", "error");
    }
  };

  // --- Handlers ---

  const handleAdd = () => {
    // Basic initial state for a new order
    setEditOrder({
      isNew: true,
      customerName: "",
      contactNumber: "",
      email: "",
      channel: "Whatsapp",
      orderType: "New",
      paymentType: "Transfer",
      totalAmount: 0,
      status: "Pending",
      orderPackages: [], // Complex logic needed to add these in a modal
      orderProducts: []
    });
    setShowEditModal(true);
  };

  const handleEdit = (order) => {
    setEditOrder({ ...order, isNew: false });
    setShowEditModal(true);
  };

  const handleSaveOrder = async (orderData) => {
    try {
      const isUpdate = !orderData.isNew;
      const url = isUpdate
        ? `http://localhost:3000/orders/${orderData.orderId}` // Note: Backend might not support PUT /orders/:id yet, check your controller
        : `http://localhost:3000/orders`;
      
      const method = isUpdate ? "PUT" : "POST"; // Ensure your backend has @Put(':id') or @Patch(':id')

      // IMPORTANT: If your backend CreateOrderDto creates IDs automatically, 
      // you don't send orderId for new items.
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Failed to save order");

      showNotification(
        isUpdate ? "Order updated successfully!" : "Order created successfully!",
        "success"
      );
      
      fetchOrders(); // Refresh list to get generated IDs and dates
      setShowEditModal(false);
      setEditOrder(null);
    } catch (err) {
      console.error("Error saving order:", err);
      showNotification("Failed to save order. Check console.", "error");
    }
  };

  // --- Delete Logic ---

  const confirmDelete = (order) => {
    setDeleteOrder(order);
    setDeleteModalVisible(true);
    setTimeout(() => setShowDeleteModal(true), 10);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setDeleteModalVisible(false);
      setDeleteOrder(null);
    }, 300);
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    try {
      const res = await fetch(`http://localhost:3000/orders/${deleteOrder.orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");

      setOrders((prev) => prev.filter((o) => o.orderId !== deleteOrder.orderId));
      showNotification("Order deleted successfully", "success");
    } catch (err) {
      showNotification("Failed to delete order", "error");
    } finally {
      closeDeleteModal();
    }
  };

  // --- Helpers for Badges ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex gap-6 relative">
      {/* Notification Toast */}
      {notification.message && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Order Management</h2>
          <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            <FontAwesomeIcon icon={faPlus} /> New Order
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Total (RM)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-blue-600">{order.orderId}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.contactNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{order.channel}</td>
                    <td className="py-3 px-4 font-semibold">
                      {Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-yellow-600" onClick={() => setSelectedOrder(order)}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-600" onClick={() => handleEdit(order)}>
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-red-600" onClick={() => confirmDelete(order)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* EDIT/ADD MODAL */}
      {showEditModal && editOrder && (
        <OrderEditModal 
          order={editOrder} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleSaveOrder} 
        />
      )}

      {/* DELETE MODAL (Same as Product) */}
      {deleteModalVisible && deleteOrder && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${showDeleteModal ? "opacity-100" : "opacity-0"}`}>
          <div className={`bg-white p-8 rounded-2xl shadow-xl w-[420px] text-center transform transition-transform duration-300 ${showDeleteModal ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Delete Order?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete <span className="font-bold text-red-600">{deleteOrder.orderId}</span>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={closeDeleteModal} className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;