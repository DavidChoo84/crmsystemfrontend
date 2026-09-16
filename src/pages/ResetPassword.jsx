import React, { useState, useEffect } from "react";

export const ResetPassword = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tokenMissing, setTokenMissing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pull the token out of the URL on mount (?token=xxxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setTokenMissing(true);
      setMessage({
        type: "error",
        text: "No reset token found. Please use the link from your email.",
      });
    } else {
      setToken(t);
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reset link is invalid or has expired.");
      }

      setSuccess(true);
      setMessage({ type: "success", text: "Password reset successfully! Redirecting to login..." });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Set a new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose a new password for your account
          </p>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {!tokenMissing && !success && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {(tokenMissing || success) && (
          <div className="text-center pt-2">
            <a
              href="/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};