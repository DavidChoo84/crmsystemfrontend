import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown, faChevronRight, faSackDollar, faBolt,
  faCoins, faBullseye, faPercent, faHandHoldingDollar, faChartLine
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const fmtRM = (n) => `RM ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const KpiCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center text-base mb-3`}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-xl font-black text-gray-900">{value}</p>
  </div>
);

// Handles both the always-expanded "Total project's data" aggregate card
// (pass alwaysExpanded + every authorized project's ID) and each
// collapsible per-project row (pass a single-element projectIds array).
// Data is fetched lazily — only once expanded — and re-fetched whenever
// that section's own month filter changes.
const DashboardSection = ({ title, projectIds, alwaysExpanded = false }) => {
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const [summary, setSummary] = useState({
    totalSales: 0, currentSales: 0, estimateSales: 0, expenses: 0, salesTarget: 0,
    adSpend: 0, totalLead: 0, totalOrders: 0, cpr: 0, conversionRate: 0,
    returnOnExpenses: 0, roas: 0,
  });
  const hasLeads = Number(summary.totalLead) > 0;
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [errors, setErrors] = useState([]);

  const idsParam = (projectIds || []).join(",");

  useEffect(() => {
    if (expanded && idsParam) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, selectedMonth, idsParam]);

  const fetchData = async () => {
    if (!idsParam) return;
    setLoading(true);
    const [year, month] = selectedMonth.split("-").map(Number);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch(`http://localhost:3000/reports/${idsParam}/summary?year=${year}&month=${month}`, { headers }),
        fetch(`http://localhost:3000/reports/${idsParam}/daily?year=${year}&month=${month}`, { headers }),
        fetch(`http://localhost:3000/reports/${idsParam}/weekly?year=${year}&month=${month}`, { headers }),
        fetch(`http://localhost:3000/reports/${idsParam}/monthly?months=12&year=${year}&month=${month}`, { headers }),
      ]);

      const failures = [];

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        // Merge rather than replace outright — if the backend response is
        // missing a field (e.g. still running an older deploy without
        // roas/totalLead), the default stays 0 instead of becoming
        // undefined and crashing .toFixed()/toLocaleString() downstream.
        setSummary((prev) => ({ ...prev, ...data }));
      } else {
        failures.push(`summary (HTTP ${summaryRes.status})`);
      }

      if (dailyRes.ok) setDailyData(await dailyRes.json());
      else failures.push(`daily (HTTP ${dailyRes.status})`);

      if (weeklyRes.ok) setWeeklyData(await weeklyRes.json());
      else failures.push(`weekly (HTTP ${weeklyRes.status})`);

      if (monthlyRes.ok) setMonthlyData(await monthlyRes.json());
      else failures.push(`monthly (HTTP ${monthlyRes.status})`);

      setErrors(failures);
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setErrors([`network error: ${err.message}`]);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => !alwaysExpanded && setExpanded((e) => !e)}
        className={`w-full flex items-center justify-between px-6 py-4 text-left ${alwaysExpanded ? "cursor-default" : "hover:bg-gray-50 transition"}`}
      >
        <div className="flex items-center gap-3">
          {!alwaysExpanded && (
            <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} className="text-gray-400 text-xs" />
          )}
          <span className="font-bold text-gray-800">{title}</span>
        </div>

        {expanded && (
          <input
            type="month"
            value={selectedMonth}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-5">
          {loading && !loaded ? (
            <div className="text-center py-10 text-gray-400 text-sm animate-pulse">Loading...</div>
          ) : (
            <>
              {errors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  Couldn't load: {errors.join(", ")}. Check the browser's Network tab for the response body.
                </div>
              )}

              {errors.length === 0 &&
                Number(summary.currentSales) === 0 &&
                Number(summary.adSpend) === 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    No sales or ad spend found for this month. Try another month above — and note
                    that only non-cancelled orders built from <strong>template packages</strong> are
                    counted (custom packages and older orders without a package link are excluded).
                  </div>
                )}

              {/* KPI CARDS */}
              {/* Total Lead / Ads Spend = sum of the month's daily entries
                  (Project Target page). CPR = Ads Spend / Total Lead.
                  Conversion Rate = orders / Total Lead × 100%. */}
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
                <KpiCard icon={faSackDollar} label="Total Sales" value={fmtRM(summary.currentSales)} color="text-emerald-600" bg="bg-emerald-50" />
                <KpiCard icon={faChartLine} label="Estimate Sales" value={fmtRM(summary.estimateSales)} color="text-teal-600" bg="bg-teal-50" />
                <KpiCard icon={faBolt} label="ROAS" value={`${Number(summary.roas || 0).toFixed(2)}x`} color="text-blue-600" bg="bg-blue-50" />
                <KpiCard
                  icon={faPercent}
                  label="Conversion Rate"
                  value={hasLeads ? `${Number(summary.conversionRate || 0).toFixed(2)}%` : "—"}
                  color="text-rose-600"
                  bg="bg-rose-50"
                />
                <KpiCard icon={faBullseye} label="Total Lead" value={Number(summary.totalLead || 0).toLocaleString()} color="text-purple-600" bg="bg-purple-50" />
                <KpiCard icon={faCoins} label="Ads Spend" value={fmtRM(summary.adSpend)} color="text-amber-600" bg="bg-amber-50" />
                <KpiCard icon={faHandHoldingDollar} label="CPR" value={hasLeads ? fmtRM(summary.cpr) : "—"} color="text-sky-600" bg="bg-sky-50" />
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Daily Sales</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} tickFormatter={(l) => String(l).slice(8, 10)} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(v) => fmtRM(v)} />
                      <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Weekly Sales</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} tickFormatter={(l) => `Wk of ${String(l).slice(5)}`} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(v) => fmtRM(v)} />
                      <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 xl:col-span-2">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Monthly Sales (12 Months)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(v) => fmtRM(v)} />
                      <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardSection;