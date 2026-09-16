import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faArrowLeft, faFloppyDisk, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ProjectTarget = () => {
  const { projectName } = useParams();
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const [targetOfMonth, setTargetOfMonth] = useState("");
  const [estimateSales, setEstimateSales] = useState("");
  const [adSpend, setAdSpend] = useState("");
  const [history, setHistory] = useState([]);

  const getToken = () => localStorage.getItem("token");

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchProjectId();
  }, [projectName]);

  useEffect(() => {
    if (projectId) {
      fetchHistory();
      fetchSelectedMonth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, selectedMonth]);

  const fetchProjectId = async () => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3000/projects/name/${encodeURIComponent(projectName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Project not found");
      const data = await res.json();
      setProjectId(data.projectId);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load project", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3000/project-targets/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const fetchSelectedMonth = async () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3000/project-targets/${projectId}/${year}/${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setTargetOfMonth(data.targetOfMonth ?? "");
          setEstimateSales(data.estimateSales ?? "");
          setAdSpend(data.adSpend ?? "");
          return;
        }
      }
      setTargetOfMonth("");
      setEstimateSales("");
      setAdSpend("");
    } catch (err) {
      console.error("Failed to fetch month target", err);
      setTargetOfMonth("");
      setEstimateSales("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const [year, month] = selectedMonth.split("-").map(Number);
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/project-targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          year,
          month,
          targetOfMonth: Number(targetOfMonth) || 0,
          estimateSales: Number(estimateSales) || 0,
          adSpend: Number(adSpend) || 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to save target");

      showNotification("Target saved successfully!");
      fetchHistory();
    } catch (err) {
      console.error(err);
      showNotification(err.message || "Failed to save target", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-400 animate-pulse font-medium text-center">Loading...</div>;

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      {notification.message && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${notification.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(`/project/${encodeURIComponent(projectName)}`)}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faBullseye} className="text-rose-500" />
            Project Target
          </h2>
          <p className="text-gray-400 text-sm capitalize">{projectName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM CARD */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Target of the Month (RM)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={targetOfMonth}
                onChange={(e) => setTargetOfMonth(e.target.value)}
                placeholder="0.00"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Estimate Sales of the Month (RM)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimateSales}
                onChange={(e) => setEstimateSales(e.target.value)}
                placeholder="0.00"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Ad Spend (RM)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={adSpend}
                onChange={(e) => setAdSpend(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !projectId}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
              {saving ? "Saving..." : "Save Target"}
            </button>
          </form>
        </div>

        {/* HISTORY CARD */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faClockRotateLeft} /> History
          </h3>

          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No targets recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2 pr-4">Target (RM)</th>
                    <th className="py-2 pr-4">Estimate Sales (RM)</th>
                    <th className="py-2 pr-4">Ad Spend (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={`${h.year}-${h.month}`} className="border-t border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">
                        {monthNames[h.month - 1]} {h.year}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        RM {Number(h.targetOfMonth).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        RM {Number(h.estimateSales).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        RM {Number(h.adSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTarget;