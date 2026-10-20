// Backend API base URL.
// - Local dev: falls back to http://localhost:3000
// - Online (Vercel/Netlify): set REACT_APP_API_URL in the hosting dashboard,
//   e.g. https://crm-backend.onrender.com  (no trailing slash)
export const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");
