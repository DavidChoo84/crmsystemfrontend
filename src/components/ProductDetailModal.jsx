import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative text-gray-800"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-5 text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-6">Product Details</h2>

          {/* Detail pills layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Product ID</span>
              <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                {product.productId}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Product Name</span>
              <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                {product.productName}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Costing</span>
              <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                {product.costing}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Quantity</span>
              <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                {product.quantity}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Unit</span>
              <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                {product.unit}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Qty / Box</span>
              <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                {product.quantityPerBox}
              </span>
            </div>

            {product.project && (
              <div className="flex flex-col col-span-2">
                <span className="text-sm text-gray-500 mb-1">Project</span>
                <span className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-center">
                  {product.project.projectName}
                </span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-center">
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

export default ProductDetailModal;
