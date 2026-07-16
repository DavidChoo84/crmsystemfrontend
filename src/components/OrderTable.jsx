import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export const OrderTable = ({ orders, viewMode = "orders", onSelect, onEdit, onDelete, onMarkAsSent }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      case "Sent": return "bg-purple-100 text-purple-800"; // 🌟 Style for Sent status
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
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
                <td className="py-3 px-4 font-bold text-blue-600">{order.orderId}</td>
                <td className="py-3 px-4 text-sm">
                  {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{order.customer?.name || order.customerName || "N/A"}</div>
                  <div className="text-xs text-gray-500">{order.customer?.mobilePhone || order.contactNumber || ""}</div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className="text-xs border px-2 py-0.5 rounded-full bg-gray-50">
                    {order.channel || order.orderType || "Direct"}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold">{Number(order.totalAmount).toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status || "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2 items-center">
                    
                    {/* 🚀 1. LOGISTIC ONLY: Button displays if viewMode is logistic and NOT yet Shipped */}
                    {viewMode === "logistic" && order.status !== "Shipped" && (
                      <button 
                        className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors"
                        onClick={() => onMarkAsSent(order.orderId)}
                        title="Mark as Shipped"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    )}

                    {/* Standard View Details Button */}
                    <button 
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-yellow-600 transition-colors" 
                      onClick={() => onSelect(order)}
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    
                    {/* 🔒 2. MODIFIED EDIT BUTTON: Disabled if order status is 'Shipped' */}
                    <button 
                      disabled={order.status === "Shipped"}
                      onClick={() => onEdit(order)}
                      className={`p-2 rounded-lg transition-colors ${
                        order.status === "Shipped"
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed opacity-60"
                          : "bg-gray-100 hover:bg-gray-200 text-blue-600"
                      }`}
                      title={order.status === "Shipped" ? "Shipped orders are locked and cannot be edited" : "Edit Order"}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    
                    {/* 🔒 3. MODIFIED DELETE BUTTON: Disabled if viewMode is 'logistic' OR status is 'Shipped' */}
                    <button 
                      disabled={viewMode === "logistic" || order.status === "Shipped"}
                      onClick={() => onDelete(order)}
                      className={`p-2 rounded-lg transition-colors ${
                        (viewMode === "logistic" || order.status === "Shipped")
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed opacity-60"
                          : "bg-gray-100 hover:bg-gray-200 text-red-600"
                      }`}
                      title={
                        order.status === "Shipped" 
                          ? "Shipped orders cannot be deleted" 
                          : viewMode === "logistic" 
                            ? "Delete disabled in logistic view" 
                            : "Delete Order"
                      }
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-8 text-gray-400 italic bg-gray-50/50">
                No matching orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};