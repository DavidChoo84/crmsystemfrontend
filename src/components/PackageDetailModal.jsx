import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faGift, faPlus } from "@fortawesome/free-solid-svg-icons";

const PackageDetailModal = ({ pkg, onClose }) => {
  if (!pkg) return null;

  // Helper to check if a value should be displayed
  const show = (val) => val !== null && val !== undefined && val !== "";
  const money = (val) => `RM ${(Number(val) || 0).toFixed(2)}`;

  // Main products first, then add-ons, then free gifts
  const typeRank = (item) => (item.isFreeItem ? 2 : item.isAddOn ? 1 : 0);
  const items = [...(pkg.packageProducts || [])].sort((a, b) => typeRank(a) - typeRank(b));

  const totalUnits = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const productCost = items.reduce(
    (sum, item) => sum + Number(item.product?.costing || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 pb-6 relative text-gray-800 max-h-[85vh] flex flex-col"
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
          <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
              {show(pkg.packageId) && <Detail label="Package ID" value={pkg.packageId} />}
              {show(pkg.packageName) && <Detail label="Package Name" value={pkg.packageName} />}
              {show(pkg.sellingPrice) && <Detail label="Selling Price" value={money(pkg.sellingPrice)} />}
              {show(pkg.shippingCost) && <Detail label="Shipping Cost" value={money(pkg.shippingCost)} />}
              {show(pkg.totalCost) && <Detail label="Total Cost" value={money(pkg.totalCost)} />}
              {show(pkg.average) && <Detail label="Average Cost" value={money(pkg.average)} />}
              {show(pkg.costMargin) && <Detail label="Cost Margin" value={pkg.costMargin} />}

              {pkg.project && show(pkg.project.projectName) && (
                <div className="flex flex-col col-span-2 sm:col-span-3">
                  <span className="text-sm text-gray-500 mb-1">Project</span>
                  <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                    {pkg.project.projectName}
                  </span>
                </div>
              )}
            </div>

            {/* 📦 Products included in this package */}
            <div className="pt-4 border-t">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
                <FontAwesomeIcon icon={faBoxOpen} className="text-orange-500" />
                Products Included
                <span className="text-xs font-normal normal-case text-gray-400">
                  ({items.length} {items.length === 1 ? "product" : "products"}, {totalUnits} {totalUnits === 1 ? "unit" : "units"})
                </span>
              </h3>

              {items.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed rounded-xl text-gray-400 text-sm italic">
                  No products in this package.
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-800 text-white text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Product</th>
                        <th className="px-4 py-2.5 font-medium text-center">Qty</th>
                        <th className="px-4 py-2.5 font-medium text-right">Unit Cost</th>
                        <th className="px-4 py-2.5 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const unitCost = Number(item.product?.costing || 0);
                        const qty = Number(item.quantity || 0);
                        return (
                          <tr key={item.packageProductId || idx} className="border-t">
                            <td className="px-4 py-2.5">
                              <div className="font-medium text-gray-800">
                                {item.product?.productName || "Unknown Product"}
                                <TypeBadge item={item} />
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                {item.product?.productId}
                                {item.product?.unit && ` · per ${item.product.unit}`}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center font-bold text-blue-700">x{qty}</td>
                            <td className="px-4 py-2.5 text-right text-gray-600">{unitCost.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-right font-medium">{(unitCost * qty).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t font-semibold">
                      <tr>
                        <td className="px-4 py-2.5 text-gray-500 uppercase text-xs">Total</td>
                        <td className="px-4 py-2.5 text-center">{totalUnits}</td>
                        <td></td>
                        <td className="px-4 py-2.5 text-right">{money(productCost)}</td>
                      </tr>
                    </tfoot>
                  </table>
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

/* Marks free gifts and add-ons; main products get no badge */
const TypeBadge = ({ item }) => {
  if (item.isFreeItem) {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-pink-100 text-pink-600 border border-pink-200 px-1.5 py-0.5 rounded">
        <FontAwesomeIcon icon={faGift} /> Free Gift
      </span>
    );
  }
  if (item.isAddOn) {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
        <FontAwesomeIcon icon={faPlus} /> Add-on
      </span>
    );
  }
  return null;
};

export default PackageDetailModal;
