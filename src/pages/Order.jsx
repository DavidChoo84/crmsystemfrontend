import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import OrderDetailModal from "../components/OrderDetailModal";
import OrderEditModal from "../components/OrderEditModal";
import { OrderFilters } from "../components/OrderFilters";
import { OrderTable } from "../components/OrderTable";

const Order = ({ viewMode = "orders" }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  const [filterExactDate, setFilterExactDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => { fetchOrders(); }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // Fetch Orders (Secured)
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token"); // 🚀 Get token
      const res = await fetch("http://localhost:3000/orders", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      showNotification("Failed to fetch orders", "error");
    }
  };

  const handleAdd = () => {
    setEditOrder({ isNew: true, customerId: "", customerName: "", channel: "Whatsapp", totalAmount: 0, status: "Pending", orderPackages: [], orderProducts: [] });
    setShowEditModal(true);
  };

  // Mark Order as Sent (Secured & Logistic Only)
  const handleMarkAsSent = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Shipped" }) // 🌟 Changed from "Sent" to "Shipped"
      });

      if (!res.ok) throw new Error("Failed to mark order as shipped.");

      // Instantly update UI status to lock it out using "Shipped"
      setOrders((prev) =>
        prev.map((ord) => (ord.orderId === orderId ? { ...ord, status: "Shipped" } : ord)) // 🌟 Changed here
      );

      showNotification("Order marked as Shipped! Record is now locked.");
    } catch (err) {
      console.error("Failed to ship order:", err.message);
      showNotification(err.message || "Failed to update status", "error");
    }
  };

  // Save/Update Order (Secured)
  const handleSaveOrder = async (orderData, rawFile) => {
    try {
      const token = localStorage.getItem("token"); // 🚀 Get token
      const isUpdate = !orderData.isNew;
      let finalReceiptUrl = orderData.receiptUrl || "";

      // 1. Upload receipt if file exists (Secured)
      if (rawFile) {
        const formData = new FormData();
        formData.append("file", rawFile);

        const uploadRes = await fetch("http://localhost:3000/orders/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}` // Pass token safely without breaking multipart boundary
          },
          body: formData, 
        });

        if (!uploadRes.ok) throw new Error("Receipt file upload failed.");
        
        const uploadData = await uploadRes.json();
        finalReceiptUrl = uploadData.filePath; 
      }

      // 2. Prepare JSON payload
      const url = isUpdate 
        ? `http://localhost:3000/orders/${orderData.orderId}` 
        : `http://localhost:3000/orders`;
      
      const payload = { 
        ...orderData, 
        receiptUrl: finalReceiptUrl, 
        shippingFee: Number(orderData.shippingFee || 0), 
        totalAmount: Number(orderData.totalAmount || 0), 
        orderDate: orderData.orderDate ? new Date(orderData.orderDate).toISOString() : new Date().toISOString() 
      };
      delete payload.isNew;

      const res = await fetch(url, { 
        method: isUpdate ? "PATCH" : "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🚀 Pass token
        }, 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) throw new Error("Failed to write order records.");

      showNotification(isUpdate ? "Order updated successfully!" : "Order created successfully!");
      fetchOrders();
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to write order records:", err.message);
      alert(`Error: ${err.message || "Check server console"}`);
      showNotification(err.message || "Failed to save order", "error");
    }
  };

  // Delete Order (Secured)
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token"); // 🚀 Get token
      const res = await fetch(`http://localhost:3000/orders/${deleteOrder.orderId}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev.filter((o) => o.orderId !== deleteOrder.orderId));
      showNotification("Order deleted successfully");
    } catch {
      showNotification("Failed to delete", "error");
    } finally {
      setShowDeleteModal(false);
      setDeleteModalVisible(false);
    }
  };

  // Filter Logic Engine
  const filteredOrders = orders.filter((order) => {
    const rawDate = order.orderDate || order.createdAt;
    if (!rawDate) return !filterExactDate && !filterMonth;
    const d = new Date(rawDate);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const localIso = `${d.getFullYear()}-${month}-${String(d.getDate()).padStart(2, "0")}`;
    return (!filterExactDate || localIso === filterExactDate) && (!filterMonth || month === filterMonth);
  });

  return (
    <div className="flex gap-6 relative w-full">
      {notification.message && <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>{notification.message}</div>}

      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {viewMode === "logistic" ? "Logistic Management" : "Order Management"}
          </h2>
          
          {viewMode !== "logistic" && (
            <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              <FontAwesomeIcon icon={faPlus} /> New Order
            </button>
          )}
        </div>

        <OrderFilters 
          filterMonth={filterMonth} setFilterMonth={setFilterMonth} 
          filterExactDate={filterExactDate} setFilterExactDate={setFilterExactDate} 
        />

        {/* ✅ Passed onMarkAsSent to the table layout */}
        <OrderTable 
          orders={filteredOrders} 
          viewMode={viewMode}
          onSelect={setSelectedOrder} 
          onMarkAsSent={handleMarkAsSent}
          onEdit={(order) => { setEditOrder({ ...order, isNew: false }); setShowEditModal(true); }} 
          onDelete={(order) => { setDeleteOrder(order); setDeleteModalVisible(true); setTimeout(() => setShowDeleteModal(true), 10); }} 
        />
      </div>

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
      {showEditModal && editOrder && (
        <OrderEditModal 
          order={editOrder} 
          viewMode={viewMode} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleSaveOrder} 
        />
      )}
      
      {deleteModalVisible && deleteOrder && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${showDeleteModal ? "opacity-100" : "opacity-0"}`}>
          <div className={`bg-white p-8 rounded-2xl shadow-xl w-[420px] text-center transform transition-transform duration-300 ${showDeleteModal ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Delete Order?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete <span className="font-bold text-red-600">{deleteOrder.orderId}</span>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => { setShowDeleteModal(false); setDeleteModalVisible(false); }} className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;