import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash, faPlus, faTruck } from "@fortawesome/free-solid-svg-icons";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { OrderEditModal } from "../components/OrderEditModal";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchOrders();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const fetchOrders = async () => {
    try {
      // The backend service we wrote uses relations: ['orderPackages', 'orderPackages.orderProducts']
      const res = await fetch("http://localhost:3000/orders");
      const data = await res.json();
      
      // Sort by ID descending so newest orders are on top
      setOrders(data.sort((a, b) => b.orderId.localeCompare(a.orderId)));
    } catch (error) {
      showNotification("Failed to fetch orders", "error");
    }
  };

  const handleAdd = async () => {
    setEditOrder({
      isNew: true,
      customerName: "",
      channel: "Whatsapp",
      paymentType: "TNG",
      orderType: "New",
      shippingFee: 0,
      totalAmount: 0,
      orderPackages: [] // This will hold the nested packages and products
    });
    setShowEditModal(true);
  };

  const handleSaveOrder = async (orderData) => {
    try {
      const isUpdate = !orderData.isNew;
      const url = isUpdate 
        ? `http://localhost:3000/orders/${orderData.orderId}` 
        : `http://localhost:3000/orders`;
      const method = isUpdate ? "PATCH" : "POST";

      // --- CLEANING DATA FOR BACKEND ---
      const payload = {
        ...orderData,
        // 1. Ensure numbers are actually numbers
        shippingFee: Number(orderData.shippingFee),
        totalAmount: Number(orderData.totalAmount),
      
        // 2. Format Dates properly for the Class-Validator @IsDate()
        orderDate: new Date(orderData.orderDate).toISOString(),
        dateOfBirth: orderData.dateOfBirth ? new Date(orderData.dateOfBirth).toISOString() : null,

        // 3. Map Packages and ensure their sub-fields are numbers too
        orderPackages: orderData.orderPackages.map(pkg => ({
          ...pkg,
          packagePrice: Number(pkg.packagePrice),
          quantity: Number(pkg.quantity),
          // Ensure products inside packages are also clean
          orderProducts: pkg.orderProducts?.map(prod => ({
            ...prod,
            unitCost: Number(prod.unitCost),
            quantity: Number(prod.quantity)
          })) || []
        }))
      };

      // Remove UI-only flags before sending
      delete payload.isNew;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // This will tell us EXACTLY what class-validator didn't like
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(", ") : errorData.message);
      }

      const saved = await res.json();

      // Update Local State
      setOrders((prev) =>
        isUpdate
          ? prev.map((o) => (o.orderId === saved.orderId ? saved : o))
          : [saved, ...prev]
      );

      showNotification(isUpdate ? "Order updated!" : "Order created!", "success");
      setShowEditModal(false);
      setEditOrder(null);
    } catch (err) {
      console.error("Save Error:", err);
      showNotification(err.message, "error");
    }
  };
  
  // Helper to show what's inside the order
  const renderOrderSummary = (order) => {
    if (!order.orderPackages || order.orderPackages.length === 0) return "No items";
    
    const firstPkg = order.orderPackages[0].packageName;
    const extraCount = order.orderPackages.length - 1;
    
    return (
      <div className="text-sm">
        <span className="font-medium text-gray-800">{firstPkg}</span>
        {extraCount > 0 && <span className="text-blue-500 ml-1">+{extraCount} more pkg</span>}
      </div>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Order Management</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create New Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Packages</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Total (RM)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {orders.map((order) => (
              <tr key={order.orderId} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-600">{order.orderId}</td>
                <td className="py-3 px-4">
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="py-3 px-4">{renderOrderSummary(order)}</td>
                <td className="py-3 px-4">
                  <span className="text-xs border px-2 py-0.5 rounded-full">{order.channel}</span>
                </td>
                <td className="py-3 px-4 font-semibold">{Number(order.totalAmount).toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusStyle(order.status)}`}>
                    {order.status || 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-50">
                      <FontAwesomeIcon icon={faEye} className="text-yellow-600" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50">
                      <FontAwesomeIcon icon={faPenToSquare} className="text-blue-600" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-100 hover:bg-red-50">
                      <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals would go here (similar to PackageList) */}
      
      {notification.message && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default OrderList;