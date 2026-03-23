import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const PackageDetailModal = ({ pkg, onClose }) => {
  if (!pkg) return null;

  // Helper to check if a value should be displayed
  const show = (val) => val !== null && val !== undefined && val !== "";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
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
            className="absolute top-4 right-5 text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>

          <h2 className="text-2xl font-semibold text-center mb-6">
            Package Details
          </h2>

          {/* SCROLLABLE CONTENT */}
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "60vh" }}>
            <div className="grid grid-cols-2 gap-4 pb-4">

              {show(pkg.packageId) && <Detail label="Package ID" value={pkg.packageId} />}
              {show(pkg.packageName) && <Detail label="Package Name" value={pkg.packageName} />}
              {show(pkg.sellingPrice) && <Detail label="Selling Price" value={pkg.sellingPrice} />}
              {show(pkg.shippingCost) && <Detail label="Shipping Cost" value={pkg.shippingCost} />}
              {show(pkg.totalCost) && <Detail label="Total Cost" value={pkg.totalCost} />}
              {show(pkg.average) && <Detail label="Average Cost" value={pkg.average} />}
              {show(pkg.costMargin) && <Detail label="Cost Margin" value={pkg.costMargin} />}
              
              {show(pkg.product) && <Detail label="Product" value={pkg.product} />}
              {show(pkg.quantity) && <Detail label="Quantity" value={pkg.quantity} />}

              {show(pkg.freeItem1) && <Detail label="Free Item 1" value={pkg.freeItem1} />}
              {show(pkg.freeItem1Qty) && <Detail label="Free Item 1 Qty" value={pkg.freeItem1Qty} />}

              {show(pkg.freeItem2) && <Detail label="Free Item 2" value={pkg.freeItem2} />}
              {show(pkg.freeItem2Qty) && <Detail label="Free Item 2 Qty" value={pkg.freeItem2Qty} />}

              {show(pkg.freeItem3) && <Detail label="Free Item 3" value={pkg.freeItem3} />}
              {show(pkg.freeItem3Qty) && <Detail label="Free Item 3 Qty" value={pkg.freeItem3Qty} />}

              {show(pkg.freeItem4) && <Detail label="Free Item 4" value={pkg.freeItem4} />}
              {show(pkg.freeItem4Qty) && <Detail label="Free Item 4 Qty" value={pkg.freeItem4Qty} />}

              {pkg.project && show(pkg.project.projectName) && (
                <div className="flex flex-col col-span-2">
                  <span className="text-sm text-gray-500 mb-1">Project</span>
                  <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                    {pkg.project.projectName}
                  </span>
                </div>
              )}

            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* 💙 Reusable "pill" visual component */
const Detail = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500 mb-1">{label}</span>
    <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center break-words">
      {value}
    </span>
  </div>
);

export default PackageDetailModal;
