import React from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendar } from 'react-icons/fa';

const MonthSelector = ({ currentDate, onPrev, onNext, onDateChange }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years (current year se 2 saal pehle tak)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear; i++) {
    years.push(i);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <FaCalendar className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-700">Select Month:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="p-2 hover:bg-gray-100 rounded-lg transition border border-gray-200"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-2">
            <select
              value={currentDate.getMonth()}
              onChange={(e) => {
                const newDate = new Date(currentDate);
                newDate.setMonth(parseInt(e.target.value));
                onDateChange(newDate);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(currentDate);
                newDate.setFullYear(parseInt(e.target.value));
                onDateChange(newDate);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition border border-gray-200"
          >
            <FaChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;