import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import Loader from '../common/Loader';

const ReceiptView = () => {
  const { userId, paymentId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [userId, paymentId]);

  const fetchReceipt = async () => {
    try {
      const response = await api.get(`payments/receipt/${userId}/${paymentId}`);
      setReceipt(response.data.receipt);
    } catch (error) {
      toast.error('Failed to load receipt');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = `
      RECEIPT
      ====================
      Receipt No: ${receipt.receiptNo}
      Date: ${new Date(receipt.date).toLocaleDateString()}
      
      Customer Details:
      ----------------
      Name: ${receipt.user.name}
      ID: ${receipt.user.userId}
      Email: ${receipt.user.email}
      Phone: ${receipt.user.phone || 'N/A'}
      
      Payment Details:
      ----------------
      Amount: ₹${receipt.payment.amount}
      Type: ${receipt.payment.type}
      Method: ${receipt.payment.method}
      Description: ${receipt.payment.description || 'N/A'}
      Transaction ID: ${receipt.payment.transactionId || 'N/A'}
      
      Recorded By: ${receipt.recordedBy}
      Status: ${receipt.status}
      
      ====================
      Thank you for your payment!
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${receipt.receiptNo}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success('Receipt downloaded');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader type="spinner" size="medium" />
          <p className="mt-2 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Receipt not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        {/* Actions - Hidden when printing */}
        <div className="flex justify-end space-x-4 mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <FiPrinter className="mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiDownload className="mr-2" />
            Download
          </button>
        </div>

        {/* Receipt Content */}
        <div className="receipt-content">
          {/* Header */}
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">PAYMENT RECEIPT</h1>
            <p className="text-gray-600 mt-2">Receipt No: {receipt.receiptNo}</p>
            <p className="text-gray-600">Date: {new Date(receipt.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{receipt.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-medium">{receipt.user.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{receipt.user.email}</p>
              </div>
              {receipt.user.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{receipt.user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Payment Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{receipt.payment.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Type</p>
                  <p className="font-medium capitalize">{receipt.payment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium capitalize">{receipt.payment.method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    receipt.status === 'paid' ? 'bg-green-100 text-green-800' :
                    receipt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {receipt.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {receipt.payment.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{receipt.payment.description}</p>
                </div>
              )}
              
              {receipt.payment.transactionId && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium">{receipt.payment.transactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-6 text-center text-gray-600">
            <p className="mb-2">Recorded by: {receipt.recordedBy}</p>
            <p className="text-sm">This is a computer generated receipt and does not require signature.</p>
            <p className="text-sm mt-4">Thank you for your payment!</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content, .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptView;