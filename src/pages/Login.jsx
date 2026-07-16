import React, { useState } from "react";

export const Login = () => {
  const [view, setView] = useState("login"); // "login" | "forgot"
  const [loading, setLoading] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false); // 🔑 Controls popup visibility
  
  // Form states
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Master Modal Local states
  const [masterId, setMasterId] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Standard login routine
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid User ID or Password");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Intercept registration access and authenticate Master Admin permissions
  const handleMasterVerify = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: masterId, password: masterPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid Master Credentials");
      }

      // Assert that the logging account holds master permission claims
      if (data.user?.role !== "master") {
        throw new Error("Access Denied: Only Master Admin accounts can register staff.");
      }

      // 💾 Cache verification credentials temporarily so Router guards grant access
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/register";
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // 🔧 Patched: now checks response.ok and safely handles non-JSON/failed responses
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:3000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // Response wasn't valid JSON (e.g. server crashed, proxy error page, etc.)
        throw new Error("Unexpected server response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link. Try again.");
      }

      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to send reset link. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {view === "login" ? "Sign in to Portal" : "Reset your password"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {view === "login" ? "Enter your admin credentials" : "Provide your registered email address"}
          </p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {view === "login" ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter user identity key"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setMessage({ type: "", text: "" }); }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>

              <div className="text-center pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">New Staff? </span>
                <button
                  type="button"
                  onClick={() => { setShowMasterModal(true); setModalError(""); }} // 👈 Triggers our authentication check pop up
                  className="text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors underline decoration-dotted underline-offset-4"
                >
                  Register New Account
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => { setView("login"); setMessage({ type: "", text: "" }); }}
                className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors pt-2 block"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 🛡️ MASTER ACCOUNT AUTHORIZATION MODAL WINDOW */}
      {showMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">🔒 Master Authorization</h3>
              <button 
                type="button" 
                onClick={() => setShowMasterModal(false)} 
                className="text-gray-400 hover:text-white transition-colors text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleMasterVerify} className="p-6 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Creating new profiles requires authorization parameters from a registered <strong>Master Admin</strong>.
              </p>

              {modalError && (
                <div className="bg-red-50 text-red-600 border border-red-100 text-xs font-semibold p-3 rounded-lg">
                  ⚠️ {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Master User ID</label>
                <input
                  type="text"
                  required
                  value={masterId}
                  onChange={(e) => setMasterId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter Master ID"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Master Password</label>
                <input
                  type="password"
                  required
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMasterModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-gray-900 text-white font-bold text-xs rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  {modalLoading ? "Verifying..." : "Verify & Open"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};