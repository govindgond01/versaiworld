import React, { useState } from 'react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';

const ExportPayments = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    category: 'all',
    type: 'all'
  });

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const response = await api.post('/export/payments', {
        ...filters,
        format
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_export_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Payments exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export payments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Export Payments</h1>
        <p className="text-gray-600 mt-1">Download payment reports in various formats</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Export Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="academy">Academy</option>
              <option value="library">Library</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="fee">Course Fee</option>
              <option value="salary">Salary</option>
              <option value="advance">Advance</option>
              <option value="refund">Refund</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Download Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleExport('csv')}
              disabled={loading}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <FiDownload className="mx-auto text-2xl text-green-600 mb-2" />
                <div className="font-medium">CSV Format</div>
                <div className="text-sm text-gray-600">Excel compatible</div>
              </div>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={loading}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <FiDownload className="mx-auto text-2xl text-red-600 mb-2" />
                <div className="font-medium">PDF Format</div>
                <div className="text-sm text-gray-600">Printable report</div>
              </div>
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={loading}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <FiDownload className="mx-auto text-2xl text-blue-600 mb-2" />
                <div className="font-medium">Excel Format</div>
                <div className="text-sm text-gray-600">XLSX file</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Export Options */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Quick Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setFilters({
                  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  endDate: new Date(),
                  category: 'all',
                  type: 'all'
                });
                handleExport('csv');
              }}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiCalendar className="mr-2" />
              Export This Month
            </button>
            <button
              onClick={() => {
                setFilters({
                  startDate: new Date(new Date().getFullYear(), 0, 1),
                  endDate: new Date(),
                  category: 'all',
                  type: 'all'
                });
                handleExport('excel');
              }}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiCalendar className="mr-2" />
              Export This Year
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPayments;