import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faUndo } from "@fortawesome/free-solid-svg-icons";

export const OrderFilters = ({ filterMonth, setFilterMonth, filterExactDate, setFilterExactDate }) => {
  const handleClearFilters = () => {
    setFilterExactDate("");
    setFilterMonth("");
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
          <FontAwesomeIcon icon={faFilter} className="text-blue-600" /> Filter Orders:
        </div>

        <select
          value={filterMonth}
          onChange={(e) => {
            setFilterMonth(e.target.value);
            setFilterExactDate(""); 
          }}
          className="px-3 py-1.5 rounded-lg border bg-gray-50 text-sm focus:outline-blue-500"
        >
          <option value="">All Months</option>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold uppercase">Or Specific Date:</span>
          <input
            type="date"
            value={filterExactDate}
            onChange={(e) => {
              setFilterExactDate(e.target.value);
              setFilterMonth(""); 
            }}
            className="px-3 py-1 rounded-lg border bg-gray-50 text-sm focus:outline-blue-500"
          />
        </div>
      </div>

      {(filterExactDate || filterMonth) && (
        <button
          onClick={handleClearFilters}
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600 transition flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faUndo} /> Reset Filter
        </button>
      )}
    </div>
  );
};