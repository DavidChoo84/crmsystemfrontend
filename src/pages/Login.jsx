import React, { useState } from "react";

export const Login = () => {
  const [view, setView] = useState("login"); // "login" | "forgot"
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

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

        // 💾 Save session data locally
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user)); // Contains: userId, name, role

        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        
        // Redirect based on user privilege role
        setTimeout(() => {
        window.location.href = "/dashboard";
        }, 1000);

    } catch (err) {
        setMessage({ type: "error", text: err.message });
    } finally {
        setLoading(false);
    }
  };

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

      const data = await response.json();
      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to send reset link. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header Header Status Toggle */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {view === "login" ? "Sign in to Portal" : "Reset your password"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {view === "login" ? "Enter your admin credentials" : "Provide your registered email address"}
          </p>
        </div>

        {/* Global Feedback Notifications */}
        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {view === "login" ? (
          /* LOGIN VIEW FORM */
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        ) : (
          /* FORGOT PASSWORD VIEW FORM */
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
    </div>
  );
};