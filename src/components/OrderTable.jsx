import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faBan, faPaperPlane, faRotateLeft, faBoxOpen } from "@fortawesome/free-solid-svg-icons";

export const OrderTable = ({ orders, viewMode = "orders", onSelect, onEdit, onCancel, onMarkAsSent, onMarkAsFailed }) => {
  const isLogistic = viewMode === "logistic";

  // Hover preview state — tracks which order's items to show and where to
  // position the tooltip. Positioned via getBoundingClientRect + `fixed`
  // rather than a CSS-only group-hover tooltip, since the table's own
  // wrapper uses overflow-hidden (needed for its rounded corners), which
  // would otherwise clip the tooltip for any row near the bottom.
  const [hoveredOrder, setHoveredOrder] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, showAbove: false });

  const TOOLTIP_WIDTH = 340;
  const TOOLTIP_EST_HEIGHT = 220;

  const handleViewHoverEnter = (order, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < TOOLTIP_EST_HEIGHT;

    let left = rect.right - TOOLTIP_WIDTH;
    if (left < 8) left = 8;
    if (left + TOOLTIP_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - TOOLTIP_WIDTH - 8;
    }

    setTooltipPos({
      top: showAbove ? rect.top - 8 : rect.bottom + 8,
      left,
      showAbove,
    });
    setHoveredOrder(order);
  };

  const handleViewHoverLeave = () => setHoveredOrder(null);

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

  const getPackageNames = (order) => {
    if (!order.orderPackages || order.orderPackages.length === 0) return "—";
    const names = order.orderPackages.map((p) => p.packageName).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "—";
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
          <tr>
            <th className="py-3 px-4">Order ID</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Customer</th>
            {!isLogistic && <th className="py-3 px-4">Channel</th>}
            {!isLogistic && <th className="py-3 px-4">Tracking Number</th>}
            {isLogistic && (
              <>
                <th className="py-3 px-4">Package Name</th>
                <th className="py-3 px-4">Tracking Number</th>
              </>
            )}
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

                {!isLogistic && (
                  <td className="py-3 px-4 text-sm">
                    <span className="text-xs border px-2 py-0.5 rounded-full bg-gray-50">
                      {order.channel || order.orderType || "Direct"}
                    </span>
                  </td>
                )}

                {!isLogistic && (
                  <td className="py-3 px-4 text-sm font-mono">
                    {order.trackingNumber || "—"}
                  </td>
                )}

                {isLogistic && (
                  <>
                    <td className="py-3 px-4 text-sm">{getPackageNames(order)}</td>
                    <td className="py-3 px-4 text-sm font-mono">
                      {order.trackingNumber || "—"}
                    </td>
                  </>
                )}

                <td className="py-3 px-4 font-semibold">{Number(order.totalAmount).toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status || "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2 items-center">
                    
                    {/* 🚀 1. LOGISTIC ONLY: Button displays if viewMode is logistic and NOT yet Shipped */}
                    {isLogistic && order.status !== "Shipped" && (
                      <button 
                        className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors"
                        onClick={() => onMarkAsSent(order.orderId)}
                        title="Mark as Shipped"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    )}

                    {/* 🔁 LOGISTIC ONLY: Revert to Pending if delivery failed after being marked Shipped */}
                    {isLogistic && order.status === "Shipped" && (
                      <button 
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                        onClick={() => onMarkAsFailed(order.orderId)}
                        title="Delivery Failed — Return to Pending"
                      >
                        <FontAwesomeIcon icon={faRotateLeft} />
                      </button>
                    )}

                    {/* Standard View Details Button — hover shows an items preview */}
                    <button 
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-yellow-600 transition-colors" 
                      onClick={() => onSelect(order)}
                      onMouseEnter={(e) => handleViewHoverEnter(order, e)}
                      onMouseLeave={handleViewHoverLeave}
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
                    
                    {/* 🚫 Cancel Order: soft-cancels via status change instead of deleting the record.
                        Disabled in logistic view, and once the order is already Shipped/Completed/Cancelled. */}
                    <button 
                      disabled={isLogistic || ["Shipped", "Completed", "Cancelled"].includes(order.status)}
                      onClick={() => onCancel(order)}
                      className={`p-2 rounded-lg transition-colors ${
                        (isLogistic || ["Shipped", "Completed", "Cancelled"].includes(order.status))
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed opacity-60"
                          : "bg-gray-100 hover:bg-gray-200 text-red-600"
                      }`}
                      title={
                        order.status === "Cancelled"
                          ? "Order already cancelled"
                          : order.status === "Shipped"
                            ? "Shipped orders cannot be cancelled"
                            : order.status === "Completed"
                              ? "Completed orders cannot be cancelled"
                              : isLogistic 
                                ? "Cancel disabled in logistic view" 
                                : "Cancel Order"
                      }
                    >
                      <FontAwesomeIcon icon={faBan} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-400 italic bg-gray-50/50">
                No matching orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Hover Preview: order items breakdown, fixed-positioned near the
          View Details button that triggered it. Rendered as a sibling of
          the table wrapper (not inside it) so it isn't clipped by the
          wrapper's overflow-hidden. */}
      {hoveredOrder && (
        <div
          className="fixed z-50 w-[340px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-none"
          style={{
            top: tooltipPos.showAbove ? undefined : tooltipPos.top,
            bottom: tooltipPos.showAbove ? window.innerHeight - tooltipPos.top : undefined,
            left: tooltipPos.left,
          }}
        >
          <div className="bg-gray-900 text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxOpen} className="text-orange-400" /> Order Items
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-800 text-white uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Package / Items</th>
                  <th className="px-3 py-2 font-medium text-right">Price (RM)</th>
                  <th className="px-3 py-2 font-medium text-center">Qty</th>
                  <th className="px-3 py-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {hoveredOrder.orderPackages && hoveredOrder.orderPackages.length > 0 ? (
                  hoveredOrder.orderPackages.map((pkg, pIdx) => (
                    <React.Fragment key={pIdx}>
                      <tr className="border-t bg-gray-50">
                        <td className="px-3 py-2 text-blue-700 font-semibold">{pkg.packageName}</td>
                        <td className="px-3 py-2 text-right font-semibold">{Number(pkg.packagePrice).toFixed(2)}</td>
                        <td className="px-3 py-2 text-center font-semibold">{pkg.quantity}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {(Number(pkg.packagePrice) * Number(pkg.quantity)).toFixed(2)}
                        </td>
                      </tr>
                      {pkg.orderProducts?.map((prod, prIdx) => (
                        <tr key={prIdx} className="border-t text-gray-500 italic">
                          <td className="px-5 py-1.5">• {prod.productName}</td>
                          <td className="px-3 py-1.5 text-right opacity-60">
                            ({Number(prod.unitCost).toFixed(2)})
                          </td>
                          <td className="px-3 py-1.5 text-center opacity-60">x{prod.quantity}</td>
                          <td></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-gray-400 italic">
                      No items in this order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};