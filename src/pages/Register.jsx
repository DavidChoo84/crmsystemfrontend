import React, { useState } from "react";
import axios from "axios";

export const Register = () => {
  const [formData, setFormData] = useState({
    userId: "",       // 🔑 Changed from username to userId
    name: "",
    email: "",        // 🔑 Added email
    password: "",
    role: "logistic", // 🔑 Defaulted to a valid lower-case enum value
    phoneNumber: ""   // Optional but supported
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token"); // Include if your endpoint remains guarded

    try {
      await axios.post("http://localhost:3000/users/register", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🎉 Account created successfully!");
      window.location.href = "/"; // Redirect back to login dashboard
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(Array.isArray(serverMessage) ? serverMessage.join(", ") : serverMessage || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white";
  const labelStyle = "block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Register Staff Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className={labelStyle}>User ID (Username Key)</label>
            <input required type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder="e.g. ahmad_01" className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Full Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ahmad Ali" className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Email Address</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ahmad@company.com" className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Password</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Phone Number (Optional)</label>
            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. 0123456789" className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>System Role</label>
            {/* 🔑 Match the enum strings expected by your backend validation exactly */}
            <select name="role" value={formData.role} onChange={handleChange} className={inputStyle}>
              <option value="logistic">Logistics Staff</option>
              <option value="cs_pc">Customer Service / Production</option>
              <option value="master">Master Admin</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => window.location.href = "/"} className="w-1/3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="w-2/3 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;