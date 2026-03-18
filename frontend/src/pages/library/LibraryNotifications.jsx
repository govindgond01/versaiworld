import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  FiBell, FiMail, FiMessageSquare, FiCheck,
  FiTrash2, FiClock, FiSearch,
  FiFilter, FiX, FiInbox
} from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const LibraryNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [page, typeFilter, readFilter, dateFilter, searchTerm]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        unreadOnly: readFilter === 'unread' ? 'true' : readFilter === 'read' ? 'false' : '',
        type: typeFilter !== 'all' ? typeFilter : ''
      };
      
      if (dateFilter) params.startDate = dateFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/notifications/my', { params });
      
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const clearAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    try {
      const readIds = notifications.filter(n => n.read).map(n => n._id);
      await Promise.all(
        readIds.map(id => api.delete(`/notifications/${id}`))
      );
      setNotifications(notifications.filter(n => !n.read));
      toast.success('Cleared read notifications');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const getChannelIcon = (channels) => {
    if (!channels) return <FiBell className="text-gray-400" />;
    if (channels.includes('email')) return <FiMail className="text-blue-500" />;
    if (channels.includes('whatsapp')) return <FiMessageSquare className="text-green-500" />;
    return <FiBell className="text-gray-400" />;
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'payment': return 'bg-green-100 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'success': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader type="spinner" size="large" />
          <p className="mt-3 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-md">
            <FiBell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{unreadCount} unread</span>
              <span>•</span>
              <span>{total} total</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm"
            >
              <FiCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
          {notifications.some(n => n.read) && (
            <button
              onClick={clearAllRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              <FiTrash2 className="w-4 h-4" />
              Clear Read
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
            
            <div className="relative">
              <FiFilter className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none text-sm"
              >
                <option value="all">All Types</option>
                <option value="system">System</option>
                <option value="payment">Payment</option>
                <option value="attendance">Attendance</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <FiX className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
            </div>

            <div className="relative">
              <FiBell className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <FiX className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
            </div>

            <div className="relative">
              <FiClock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <button
              onClick={() => {
                setTypeFilter('all');
                setReadFilter('all');
                setDateFilter('');
                setSearchTerm('');
              }}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader type="spinner" size="medium" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiInbox className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-sm text-gray-600">
              {total === 0 
                ? "You're all caught up! No notifications yet." 
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`p-5 hover:bg-gray-50 transition-all cursor-pointer ${!notification.read ? 'bg-purple-50/30 border-l-4 border-l-purple-500' : ''}`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="flex gap-4">
                  {/* Type Badge */}
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase rounded-full border ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h3 className={`font-semibold text-gray-900 ${!notification.read ? 'text-purple-900' : ''}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {notification.timeAgo}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {new Date(notification.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notification.channels && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Sent via:</span>
                          {getChannelIcon(notification.channels)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition"
                        >
                          <FiCheck className="w-4 h-4" />
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * 20, total)}</span> of{' '}
            <span className="font-medium">{total}</span> notifications
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      page === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryNotifications;