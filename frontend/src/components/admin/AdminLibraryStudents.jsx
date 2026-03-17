// frontend/src/components/admin/AdminLibraryStudents.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Loader from '../common/Loader';

const AdminLibraryStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    receiptNo: '',
    transactionId: '',
    month: new Date().toISOString().slice(0, 7),
    description: 'Library Fee Payment'
  });
  
  const [updateData, setUpdateData] = useState({
    totalFees: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students', {
        params: { studentCategory: 'library' }
      });
      
      // Your API returns students array in response.data.students
      const studentsData = response.data.students || [];
      
      // Map data to match expected format
      const mappedStudents = studentsData.map(student => ({
        ...student,
        // Ensure all financial fields exist
        totalFees: student.totalFees || student.financials?.amount || 0,
        paidFees: student.paidFees || student.financials?.paid || 0,
        feesDue: student.feesDue || student.financials?.due || 0,
        // Ensure membership fields exist
        membershipDuration: student.membershipDuration || '1_month',
        expiryDate: student.expiryDate || null
      }));
      
      setStudents(mappedStudents);
    } catch (error) {
      console.error('Fetch library students error:', error);
      toast.error('Failed to fetch library students');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async () => {
    if (!selectedStudent) return;
    
    try {
      await api.post('/payments/make', {
        userId: selectedStudent._id,
        ...paymentData,
        type: 'fee'
      });

      toast.success('Payment successful');
      setShowPaymentModal(false);
      fetchStudents();
      setSelectedStudent(null);
      setPaymentData({
        amount: '',
        paymentMethod: 'cash',
        receiptNo: '',
        transactionId: '',
        month: new Date().toISOString().slice(0, 7),
        description: 'Library Fee Payment'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
      console.error('Payment error:', error);
    }
  };

  const handleUpdateFees = async () => {
    if (!selectedStudent) return;
    
    try {
      await api.put(`/payments/update-total/${selectedStudent._id}`, {
        totalAmount: updateData.totalFees
      });

      toast.success('Library fees updated successfully');
      setShowUpdateModal(false);
      fetchStudents();
      setUpdateData({ totalFees: '' });
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

  const getPaymentStatus = (paid, total) => {
    if (total === 0) return { text: 'Not Set', color: 'bg-gray-100 text-gray-800' };
    if (paid === 0) return { text: 'Unpaid', color: 'bg-red-100 text-red-800' };
    if (paid >= total) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    return { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getMembershipStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < today) return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    if (expiry > today) {
      // Check if expires within 7 days
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return { text: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' };
      }
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'Expires Today', color: 'bg-yellow-100 text-yellow-800' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatMembershipDuration = (duration) => {
    if (!duration) return '1 Month';
    return duration.replace('_', ' ').replace('months', 'Months').replace('month', 'Month');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader type="spinner" size="large" />
      </div>
    );
  }

  const libraryStudents = students.filter(student => student.studentCategory === 'library');

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Library Students Fees</h1>
        <p className="text-gray-600 mt-2">Manage membership fees for library students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Library Members</p>
              <p className="text-2xl font-bold text-gray-900">{libraryStudents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-green-600">
                {libraryStudents.filter(s => 
                  getMembershipStatus(s.expiryDate).text === 'Active'
                ).length}
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
                {formatCurrency(libraryStudents.reduce((sum, student) => sum + (student.feesDue || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">
                {libraryStudents.filter(s => 
                  ['Expiring Soon', 'Expires Today', 'Expired'].includes(getMembershipStatus(s.expiryDate).text)
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Library Members</h2>
            <div className="text-sm text-gray-600">
              {libraryStudents.length} library members
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {libraryStudents.map((student) => {
                const progress = calculateProgress(student.paidFees || 0, student.totalFees || 0);
                const paymentStatus = getPaymentStatus(student.paidFees || 0, student.totalFees || 0);
                const membershipStatus = getMembershipStatus(student.expiryDate);
                
                return (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                        <div className="text-sm text-gray-500">ID: {student.studentId || student.userId}</div>
                        {student.phone && (
                          <div className="text-sm text-gray-500">Phone: {student.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Duration: </span>
                          <span>{formatMembershipDuration(student.membershipDuration)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Expires: </span>
                          <span>{formatDate(student.expiryDate)}</span>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${membershipStatus.color}`}>
                          {membershipStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold">{formatCurrency(student.totalFees || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Paid:</span>
                          <span className="text-green-600 font-semibold">{formatCurrency(student.paidFees || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Due:</span>
                          <span className={`font-semibold ${(student.feesDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(student.feesDue || 0)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${paymentStatus.color}`}>
                          {paymentStatus.text}
                        </span>
                        <div className="space-y-1">
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setUpdateData({ totalFees: student.totalFees || '' });
                            setShowUpdateModal(true);
                          }}
                          className="px-3 py-2 bg-yellow-500 text-white text-sm font-medium rounded hover:bg-yellow-600 transition-colors"
                        >
                          Edit Fees
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setPaymentData(prev => ({
                              ...prev,
                              amount: Math.min(student.feesDue || 0, student.totalFees || 0)
                            }));
                            setShowPaymentModal(true);
                          }}
                          disabled={!student.feesDue || student.feesDue <= 0}
                          className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                            student.feesDue > 0 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Collect Fee
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
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Collect Library Fee from {selectedStudent.name}</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-2">Membership Details</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-semibold">{formatMembershipDuration(selectedStudent.membershipDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Expires:</span>
                    <span className="font-semibold">{formatDate(selectedStudent.expiryDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Fees:</span>
                    <span className="font-semibold">{formatCurrency(selectedStudent.totalFees || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Already Paid:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedStudent.paidFees || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <span className="text-blue-700 font-bold">Due Amount:</span>
                    <span className="font-bold text-red-600">{formatCurrency(selectedStudent.feesDue || 0)}</span>
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
                    max={selectedStudent.feesDue || 0}
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {formatCurrency(selectedStudent.feesDue || 0)}
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
                    placeholder="Library membership fee"
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

      {/* Update Fees Modal */}
      {showUpdateModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Update Library Fees for {selectedStudent.name}</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Total Library Fees (₹)
                </label>
                <input
                  type="number"
                  value={updateData.totalFees}
                  onChange={(e) => setUpdateData({ totalFees: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter new total fees"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Current total: <span className="font-semibold">{formatCurrency(selectedStudent.totalFees || 0)}</span>
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
                onClick={handleUpdateFees}
                disabled={!updateData.totalFees}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Update Fees
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLibraryStudents;