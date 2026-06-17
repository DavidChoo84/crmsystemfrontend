import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, 
  faBoxOpen, 
  faUser, 
  faTruck, 
  faFileLines, 
  faClipboardList,
  faCircleCheck,
  faReceipt,
  faEye
} from "@fortawesome/free-solid-svg-icons";

const OrderDetailModal = ({ order, onClose }) => {
  console.log("Current Order Object:", order);
  const [customerData, setCustomerData] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  
  // STATE TO OVERLAY TRANSACTION RECEIPT PREVIEW
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // --- FETCH LIVE CUSTOMER DATA FROM DATABASE ---
  useEffect(() => {
    if (order && order.customerId) {
      setIsLoadingCustomer(true);
      axios
        .get(`http://localhost:3000/customers/${order.customerId}`)
        .then((res) => {
          setCustomerData(res.data);
        })
        .catch((err) => {
          console.error("Failed to load customer profile from database", err);
        })
        .finally(() => {
          setIsLoadingCustomer(false);
        });
    } else {
      setCustomerData(null);
    }
  }, [order]);

  if (!order) return null;

  // Helper for empty fields
  const displayVal = (val) => val || <span className="text-gray-400 italic">N/A</span>;

  // Fallback Logic: Use live DB data if loaded, otherwise look for snapshots attached to the order
  const finalCustomerName = customerData?.name || order.customerName || "-";
  const finalMobilePhone = customerData?.mobilePhone || order.contactNumber || "-";
  const finalFbName = customerData?.fbName || order.fbName || "-";
  const finalEmail = customerData?.email || order.email || "-";
  const finalAddress = customerData?.address || order.address || "-";
  const finalPostCode = customerData?.postCode || order.postCode || "";
  const finalState = customerData?.state || order.state || "";

  // --- 1. DYNAMIC STATUS STYLING CONFIGURATION ---
  const getOrderStatusConfig = (status) => {
    const configs = {
      Pending: { color: "bg-amber-100 text-amber-800 border-amber-300", label: "⏳ Pending" },
      Processing: { color: "bg-blue-100 text-blue-800 border-blue-300", label: "⚙️ Processing" },
      Shipped: { color: "bg-indigo-100 text-indigo-800 border-indigo-300", label: "📦 Shipped" },
      Completed: { color: "bg-green-100 text-green-800 border-green-300", label: "✅ Completed" },
      Cancelled: { color: "bg-red-100 text-red-800 border-red-300", label: "❌ Cancelled" },
    };
    return configs[status] || { color: "bg-gray-100 text-gray-800 border-gray-300", label: status };
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      Paid: "text-green-600 font-bold",
      Unpaid: "text-red-500 font-bold",
      "Partially Paid": "text-amber-600 font-bold",
      Refunded: "text-gray-500 italic",
    };
    return colors[status] || "text-gray-700";
  };

  const statusConfig = getOrderStatusConfig(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden relative">
        
        {/* Header - Fixed */}
        <div className="flex justify-between items-center bg-gray-100 px-6 py-4 border-b">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-800">Order #{order.orderId}</h3>
              {/* Dynamic Header Status Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Ordered on: {new Date(order.orderDate).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* 1. Customer & Sales Info */}
          <section className="relative">
            <h4 className="flex items-center gap-2 text-md font-bold text-blue-600 mb-3 border-b pb-1 uppercase tracking-wider">
              <FontAwesomeIcon icon={faUser} /> Customer & Sales Details
              {isLoadingCustomer && <span className="text-xs text-gray-400 normal-case animate-pulse ml-2">(Loading DB Profile...)</span>}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 bg-gray-50 p-4 rounded-lg border">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Customer Name</p>
                <p className="font-medium text-gray-800">{displayVal(finalCustomerName)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Contact Number</p>
                <p className="text-gray-800">{displayVal(finalMobilePhone)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">FB Name / Email</p>
                <p className="text-gray-800 text-sm">
                  {finalFbName !== "-" || finalEmail !== "-" ? `${finalFbName} / ${finalEmail}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Date of Birth</p>
                <p className="text-gray-800">
                  {customerData?.dateOfBirth || order.dateOfBirth ? new Date(customerData?.dateOfBirth || order.dateOfBirth).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Sales Person</p>
                <p className="text-gray-800 font-medium">{displayVal(order.salesPerson || order.salesperson)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Order Type / Channel</p>
                <p className="text-gray-800">{order.orderType} via {order.Channel || order.channel}</p>
              </div>
            </div>
          </section>

          {/* 2. Shipping & Address */}
          <section>
            <h4 className="flex items-center gap-2 text-md font-bold text-blue-600 mb-3 border-b pb-1 uppercase tracking-wider">
              <FontAwesomeIcon icon={faTruck} /> Shipping & Logistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Shipping Address</p>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{displayVal(finalAddress)}</p>
                {(finalPostCode || finalState) && (
                  <p className="text-gray-800 text-sm mt-1">{finalPostCode} {finalState}</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border grid grid-cols-1 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Courier Company</p>
                  <p className="text-gray-800 font-medium">{displayVal(order.courierCompany)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Tracking Number</p>
                  <p className="text-blue-600 font-mono font-bold">{displayVal(order.trackingNumber)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Items (Packages & Nested Products) */}
          <section>
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-700 mb-3">
              <FontAwesomeIcon icon={faBoxOpen} className="text-orange-500" /> Order Items
            </h4>
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-800 text-white font-medium uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Package / Items</th>
                    <th className="px-4 py-3 text-right">Price (RM)</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderPackages?.map((pkg, pIdx) => (
                    <React.Fragment key={pIdx}>
                      <tr className="bg-gray-50 border-t font-semibold">
                        <td className="px-4 py-3 text-blue-700">{pkg.packageName}</td>
                        <td className="px-4 py-3 text-right">{Number(pkg.packagePrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">{pkg.quantity}</td>
                        <td className="px-4 py-3 text-right">{(pkg.packagePrice * pkg.quantity).toFixed(2)}</td>
                      </tr>
                      {pkg.orderProducts?.map((prod, prIdx) => (
                        <tr key={prIdx} className="border-t text-xs text-gray-600">
                          <td className="px-8 py-2 italic">• {prod.productName}</td>
                          <td className="px-4 py-2 text-right opacity-50">({Number(prod.unitCost).toFixed(2)})</td>
                          <td className="px-4 py-2 text-center text-gray-400">x{prod.quantity}</td>
                          <td className="px-4 py-2 text-right"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Payment, Status & Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                <FontAwesomeIcon icon={faFileLines} /> Internal Remark
              </h4>
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded text-sm text-gray-700 italic">
                {displayVal(order.remark)}
              </div>
            </div>

            <div className="space-y-2">
              {/* ORDER STATUS DETAIL ROW */}
              <div className="flex justify-between text-sm items-center border-b pb-2">
                <span className="text-gray-500 font-bold uppercase flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClipboardList} className="text-gray-400" /> Order Status:
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${statusConfig.color}`}>
                  {order.status || "Pending"}
                </span>
              </div>

              {/* PAYMENT MODE DETAIL ROW WITH RECEIPT VIEW TRIGGER */}
              <div className="flex justify-between text-sm items-center pt-1 border-b pb-2">
                <span className="text-gray-500 font-bold uppercase flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-gray-400" /> Payment Mode:
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">
                    {order.paymentType} (<span className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus || "Unpaid"}</span>)
                  </span>
                  
                  {/* CONDITIONAL RECEIPT VIEW BUTTON */}
                  {order.receiptImage ? (
                    <button
                      type="button"
                      onClick={() => setIsReceiptOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2.5 py-1 rounded-md hover:bg-indigo-100 transition active:scale-95"
                    >
                      <FontAwesomeIcon icon={faReceipt} />
                      View Receipt
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic bg-gray-100 px-2 py-1 rounded">No Receipt</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-500 font-bold uppercase">Shipping Fee:</span>
                <span className="font-medium text-gray-800">RM {Number(order.shippingFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-lg mt-4">
                <span className="text-sm font-bold uppercase">Grand Total</span>
                <span className="text-2xl font-black">RM {Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* NESTED INNER OVERLAY PORTAL FOR VIEWING RECEIPT DOCS */}
        {isReceiptOpen && order.receiptImage && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-4 max-w-lg w-full flex flex-col overflow-hidden max-h-[85vh]">
              
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="text-indigo-600" /> Proof of Payment
                </span>
                <button 
                  type="button" 
                  onClick={() => setIsReceiptOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 rounded-lg border p-2">
                <img 
                  src={order.receiptImage} 
                  alt="Order Payment Attachment" 
                  className="max-w-full max-h-[60vh] object-contain rounded shadow-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="mt-4 w-full py-2.5 bg-gray-800 text-white font-bold text-sm rounded-lg hover:bg-gray-900 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderDetailModal;