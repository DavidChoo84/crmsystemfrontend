import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine, faArrowLeft, faSackDollar, faCoins,
  faBullseye, faBolt, faPercent
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const fmtRM = (n) => `RM ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const KpiCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-6 rounded-[1.75rem] border border-gray-100 shadow-sm">
    <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center text-lg mb-4`}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-black text-gray-900">{value}</p>
  </div>
);

const Reports = () => {
  const { projectName } = useParams();
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const [summary, setSummary] = useState({
    totalSales: 0, currentSales: 0, expenses: 0, salesTarget: 0, adSpend: 0, returnOnExpenses: 0,
  });
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchProjectId();
  }, [projectName]);

  useEffect(() => {
    if (projectId) {
      fetchSummary();
      fetchCharts();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:3000/reports/${projectId}/summary?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setSummary(await res.json());
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  const fetchCharts = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch(`http://localhost:3000/reports/${projectId}/daily?days=30`, { headers }),
        fetch(`http://localhost:3000/reports/${projectId}/weekly?weeks=12`, { headers }),
        fetch(`http://localhost:3000/reports/${projectId}/monthly?months=12`, { headers }),
      ]);

      if (dailyRes.ok) setDailyData(await dailyRes.json());
      if (weeklyRes.ok) setWeeklyData(await weeklyRes.json());
      if (monthlyRes.ok) setMonthlyData(await monthlyRes.json());
    } catch (err) {
      console.error("Failed to fetch charts", err);
    }
  };

  if (loading) return <div className="p-10 text-gray-400 animate-pulse font-medium text-center">Loading...</div>;

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/project/${encodeURIComponent(projectName)}`)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-emerald-500" />
              Reports
            </h2>
            <p className="text-gray-400 text-sm capitalize">{projectName}</p>
          </div>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard icon={faSackDollar} label="Total Sales" value={fmtRM(summary.totalSales)} color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard icon={faBolt} label="Current Sales" value={fmtRM(summary.currentSales)} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={faCoins} label="Expenses" value={fmtRM(summary.expenses)} color="text-rose-600" bg="bg-rose-50" />
        <KpiCard icon={faPercent} label="Return on Expenses" value={`${summary.returnOnExpenses.toFixed(2)}x`} color="text-purple-600" bg="bg-purple-50" />
        <KpiCard icon={faBullseye} label="Ad Spend" value={fmtRM(summary.adSpend)} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[1.75rem] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Daily Sales (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmtRM(v)} />
              <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-[1.75rem] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Weekly Sales (Last 12 Weeks)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmtRM(v)} />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-[1.75rem] border border-gray-100 shadow-sm xl:col-span-2">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Monthly Sales (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmtRM(v)} />
              <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;