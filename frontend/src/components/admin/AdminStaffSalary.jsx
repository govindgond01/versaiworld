import React, { useState, useEffect } from 'react';
import api from '../../services/api';  // ✅ Using api instance instead of axios
import { toast } from 'react-hot-toast';

const AdminStaffSalary = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    receiptNo: '',
    transactionId: '',
    month: new Date().toISOString().slice(0, 7),
    description: 'Salary Payment'
  });
  
  const [updateData, setUpdateData] = useState({
    salary: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');  
      
      const staffData = response.data.staff || [];
      
      const mappedStaff = staffData.map(staff => ({
        ...staff,
        salary: staff.salary || staff.financials?.amount || 0,
        paidSalary: staff.paidSalary || staff.financials?.paid || 0,
        dueSalary: staff.dueSalary || staff.financials?.due || 0
      }));
      
      setStaffList(mappedStaff);
    } catch (error) {
      console.error('Fetch staff error:', error);
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async () => {
    if (!selectedStaff) return;
    
    try {
      await api.post('/payments/make', {  // ✅ Using api instance
        userId: selectedStaff._id,
        ...paymentData,
        type: 'salary'
      });

      toast.success('Payment successful');
      setShowPaymentModal(false);
      fetchStaff();
      setSelectedStaff(null);
      setPaymentData({
        amount: '',
        paymentMethod: 'cash',
        receiptNo: '',
        transactionId: '',
        month: new Date().toISOString().slice(0, 7),
        description: 'Salary Payment'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
      console.error('Payment error:', error);
    }
  };

  const handleUpdateSalary = async () => {
    if (!selectedStaff) return;
    
    try {
      await api.put(`/payments/update-total/${selectedStaff._id}`, {  // ✅ Using api instance
        totalAmount: updateData.salary
      });

      toast.success('Salary updated successfully');
      setShowUpdateModal(false);
      fetchStaff();
      setUpdateData({ salary: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      console.error('Update error:', error);
    }
  };

  const calculateProgress = (paid, total) => {
    if (!total || total === 0) return 0;
    return Math.min(100, (paid / total) * 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStaffRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'librarian': return 'bg-purple-100 text-purple-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      case 'receptionist': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Salary Management</h1>
        <p className="text-gray-600 mt-2">Manage salary payments for all staff members</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staffList.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(staffList.reduce((sum, staff) => sum + (staff.paidSalary || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(staffList.reduce((sum, staff) => sum + (staff.dueSalary || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Staff Members</h2>
            <div className="text-sm text-gray-600">
              {staffList.length} staff members
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.map((staff) => {
                const progress = calculateProgress(staff.paidSalary || 0, staff.salary || 0);
                
                return (
                  <tr key={staff._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.email}</div>
                        <div className="text-sm text-gray-500">ID: {staff.staffId || staff.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStaffRoleBadgeColor(staff.staffRole)}`}>
                          {staff.staffRole || 'Staff'}
                        </span>
                        <div>
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            staff.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {staff.status || 'active'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Monthly:</span>
                          <span className="font-semibold">{formatCurrency(staff.salary || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Paid:</span>
                          <span className="text-green-600 font-semibold">{formatCurrency(staff.paidSalary || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Due:</span>
                          <span className={`font-semibold ${(staff.dueSalary || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(staff.dueSalary || 0)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              progress === 100 ? 'bg-green-500' :
                              progress > 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {progress === 100 ? 'Fully Paid' :
                           progress === 0 ? 'Unpaid' :
                           'Partially Paid'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            setSelectedStaff(staff);
                            setUpdateData({ salary: staff.salary || '' });
                            setShowUpdateModal(true);
                          }}
                          className="px-3 py-2 bg-yellow-500 text-white text-sm font-medium rounded hover:bg-yellow-600 transition-colors"
                        >
                          Edit Salary
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(staff);
                            setPaymentData(prev => ({
                              ...prev,
                              amount: Math.min(staff.dueSalary || 0, staff.salary || 0)
                            }));
                            setShowPaymentModal(true);
                          }}
                          disabled={!staff.dueSalary || staff.dueSalary <= 0}
                          className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                            staff.dueSalary > 0 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Pay Salary
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Pay Salary to {selectedStaff.name}</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-2">Salary Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Monthly Salary:</span>
                    <span className="font-semibold">{formatCurrency(selectedStaff.salary || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Already Paid:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedStaff.paidSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <span className="text-blue-700 font-bold">Due Amount:</span>
                    <span className="font-bold text-red-600">{formatCurrency(selectedStaff.dueSalary || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter amount"
                    max={selectedStaff.dueSalary || 0}
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {formatCurrency(selectedStaff.dueSalary || 0)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.receiptNo}
                    onChange={(e) => setPaymentData({...paymentData, receiptNo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Salary payment for month"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMakePayment}
                disabled={!paymentData.amount || parseFloat(paymentData.amount) <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Salary Modal */}
      {showUpdateModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Update Salary for {selectedStaff.name}</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  value={updateData.salary}
                  onChange={(e) => setUpdateData({ salary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter new salary"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Current salary: <span className="font-semibold">{formatCurrency(selectedStaff.salary || 0)}</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSalary}
                disabled={!updateData.salary}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Update Salary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffSalary;