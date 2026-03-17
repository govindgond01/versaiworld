import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiDownload,FiClock, FiFile, FiFileText, FiCalendar,
  FiUsers, FiCreditCard, FiBookOpen, FiCheckCircle,
  FiFilter, FiArrowRight, FiUserCheck,
  FiUserX, FiUsers as FiUsersAll, FiRefreshCw,
  FiGrid
} from 'react-icons/fi';
import {
  MdOutlineDateRange, MdOutlineWarning,
  MdOutlineSchool, MdLocalLibrary,
  MdDateRange, MdToday
} from 'react-icons/md';
import {
  BsFileEarmarkExcel, BsFileEarmarkPdf, BsFileEarmarkText,
  BsShieldCheck, BsClockHistory, BsPersonBadge,
  BsPersonWorkspace, BsBuilding, BsCalendarWeek,
  BsCalendarMonth, BsCalendar2
} from 'react-icons/bs';
import Loader from '../../components/common/Loader';
import { GiTeacher } from 'react-icons/gi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../services/api';

const ExportData = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingFilters, setFetchingFilters] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    studentCategories: [],
    staffRoles: [],
    departments: [],
    courses: []
  });

  const [formData, setFormData] = useState({
    dataType: 'students',
    format: 'csv',
    status: 'all',
    category: 'all',
    department: 'all',
    course: 'all',
    dateRange: 'all',
    startDate: null,
    endDate: null
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateRangeOptions = [
    { value: 'all', label: 'All Time', icon: <BsCalendar2 className="w-4 h-4" /> },
    { value: 'today', label: 'Today', icon: <MdToday className="w-4 h-4" /> },
    { value: 'week', label: 'This Week', icon: <BsCalendarWeek className="w-4 h-4" /> },
    { value: 'month', label: 'This Month', icon: <BsCalendarMonth className="w-4 h-4" /> },
    { value: 'custom', label: 'Custom Range', icon: <MdDateRange className="w-4 h-4" /> }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: <FiUsersAll className="w-4 h-4" /> },
    { value: 'active', label: 'Active', icon: <FiUserCheck className="w-4 h-4" /> },
    { value: 'inactive', label: 'Inactive', icon: <FiUserX className="w-4 h-4" /> }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Status', icon: <FiUsersAll className="w-4 h-4" /> },
    { value: 'paid', label: 'Paid', icon: <FiCheckCircle className="w-4 h-4" /> },
    { value: 'pending', label: 'Pending', icon: <FiClock className="w-4 h-4" /> },
    { value: 'failed', label: 'Failed', icon: <FiUserX className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const today = new Date();
    let start = null, end = null;

    switch(formData.dateRange) {
      case 'today':
        start = new Date(today.setHours(0,0,0,0));
        end = new Date(today.setHours(23,59,59,999));
        setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
        setShowDatePicker(false);
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        start.setHours(0,0,0,0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
        setShowDatePicker(false);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
        setShowDatePicker(false);
        break;
      case 'custom':
        setShowDatePicker(true);
        break;
      default:
        setFormData(prev => ({ ...prev, startDate: null, endDate: null }));
        setShowDatePicker(false);
    }
  }, [formData.dateRange]);

  const fetchFilterOptions = async () => {
    try {
      setFetchingFilters(true);
      const res = await api.get('/export/categories');

      if (res.data.success) {
        setFilterOptions({
          studentCategories: res.data.categories?.students || [],
          staffRoles: res.data.categories?.staff || [],
          departments: res.data.categories?.departments || [],
          courses: res.data.categories?.courses || []
        });
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast.error('Failed to load filter options');
    } finally {
      setFetchingFilters(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        responseType: 'blob'
      };

      const payload = {
        format: formData.format,
        ...(formData.startDate && { startDate: formData.startDate.toISOString().split('T')[0] }),
        ...(formData.endDate && { endDate: formData.endDate.toISOString().split('T')[0] })
      };

      if (formData.dataType === 'students') {
        if (formData.status !== 'all') payload.status = formData.status;
        if (formData.category !== 'all') payload.studentCategory = formData.category;
        if (formData.course !== 'all') payload.course = formData.course;
      }
      else if (formData.dataType === 'staff') {
        if (formData.status !== 'all') payload.status = formData.status;
        if (formData.category !== 'all') payload.staffRole = formData.category;
        if (formData.department !== 'all') payload.department = formData.department;
      }
      else if (formData.dataType === 'payments' || formData.dataType === 'attendance') {
        if (formData.status !== 'all') payload.paymentStatus = formData.status;
        if (formData.category === 'students' && formData.subCategory !== 'all') {
          payload.userType = 'student';
          payload.studentCategory = formData.subCategory;
        } else if (formData.category === 'staff' && formData.subCategory !== 'all') {
          payload.userType = 'staff';
          payload.staffRole = formData.subCategory;
        } else if (formData.category === 'students') {
          payload.userType = 'student';
        } else if (formData.category === 'staff') {
          payload.userType = 'staff';
        }
        if (formData.department !== 'all' && (formData.category === 'staff' || formData.subCategory?.includes('staff'))) {
          payload.department = formData.department;
        }
      }
      else if (formData.dataType === 'courses') {
        if (formData.status !== 'all') payload.status = formData.status;
        if (formData.category !== 'all') payload.studentCategory = formData.category;
        if (formData.course !== 'all') payload.course = formData.course;
      }

      const res = await api.post(
        `/export/${formData.dataType}`,
        payload,
        config
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;

      const ext = res.headers['content-type'].includes('csv') ? 'csv' :
                  res.headers['content-type'].includes('pdf') ? 'pdf' : 'xlsx';

      const dateSuffix = formData.dateRange !== 'all' ? `_${formData.dateRange}` : '';
      const statusSuffix = formData.status !== 'all' ? `_${formData.status}` : '';
      const categorySuffix = formData.category !== 'all' ? `_${formData.category}` : '';
      const subCategorySuffix = formData.subCategory && formData.subCategory !== 'all' ? `_${formData.subCategory}` : '';
      const deptSuffix = formData.department !== 'all' ? `_${formData.department}` : '';
      const courseSuffix = formData.course !== 'all' ? `_${formData.course}` : '';

      link.download = `${formData.dataType}${categorySuffix}${subCategorySuffix}${deptSuffix}${courseSuffix}${statusSuffix}${dateSuffix}_${new Date().toISOString().split('T')[0]}.${ext}`;
      link.click();
      toast.success('Export successful!');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const dataTypes = [
    { value: 'students', label: 'Students', icon: <FiUsers className="w-5 h-5" />, desc: 'Student records with fees', color: 'blue' },
    { value: 'staff', label: 'Staff', icon: <FiUsers className="w-5 h-5" />, desc: 'Staff details & salary', color: 'purple' },
    { value: 'payments', label: 'Payments', icon: <FiCreditCard className="w-5 h-5" />, desc: 'Payment transactions', color: 'green' },
    { value: 'courses', label: 'Courses', icon: <FiBookOpen className="w-5 h-5" />, desc: 'Course catalog', color: 'orange' },
    { value: 'attendance', label: 'Attendance', icon: <FiCheckCircle className="w-5 h-5" />, desc: 'Attendance records', color: 'yellow' }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', icon: <BsFileEarmarkText className="w-5 h-5" />, color: 'green' },
    { value: 'excel', label: 'Excel', icon: <BsFileEarmarkExcel className="w-5 h-5" />, color: 'green' },
    { value: 'pdf', label: 'PDF', icon: <BsFileEarmarkPdf className="w-5 h-5" />, color: 'red' }
  ];

  const getCategoryOptions = () => {
    if (formData.dataType === 'students') {
      return [
        { value: 'all', label: 'All Students', icon: <FiUsersAll className="w-4 h-4" /> },
        ...filterOptions.studentCategories.map(cat => ({
          value: cat.value,
          label: cat.label,
          icon: cat.value === 'academy' ? <GiTeacher className="w-4 h-4" /> : <MdLocalLibrary className="w-4 h-4" />
        }))
      ];
    } else if (formData.dataType === 'staff') {
      return [
        { value: 'all', label: 'All Staff', icon: <BsPersonWorkspace className="w-4 h-4" /> },
        ...filterOptions.staffRoles.map(role => ({
          value: role.value,
          label: role.label,
          icon: <BsPersonBadge className="w-4 h-4" />
        }))
      ];
    } else if (formData.dataType === 'payments' || formData.dataType === 'attendance') {
      return [
        { value: 'all', label: 'All Users', icon: <FiUsersAll className="w-4 h-4" /> },
        { value: 'students', label: 'Students', icon: <GiTeacher className="w-4 h-4" /> },
        { value: 'staff', label: 'Staff', icon: <BsPersonWorkspace className="w-4 h-4" /> }
      ];
    } else if (formData.dataType === 'courses') {
      return [
        { value: 'all', label: 'All Courses', icon: <FiBookOpen className="w-4 h-4" /> },
        ...filterOptions.studentCategories.map(cat => ({
          value: cat.value,
          label: `${cat.label} Courses`,
          icon: cat.value === 'academy' ? <GiTeacher className="w-4 h-4" /> : <MdLocalLibrary className="w-4 h-4" />
        }))
      ];
    }
    return [];
  };

  const courseOptions = [
    { value: 'all', label: 'All Courses', icon: <FiBookOpen className="w-4 h-4" /> },
    ...filterOptions.courses.map(course => ({
      value: course.value,
      label: course.label,
      icon: <MdOutlineSchool className="w-4 h-4" />
    }))
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments', icon: <BsBuilding className="w-4 h-4" /> },
    ...filterOptions.departments.map(dept => ({
      value: dept.value,
      label: dept.label,
      icon: <BsBuilding className="w-4 h-4" />
    }))
  ];

  const getSubCategoryOptions = () => {
    if (formData.category === 'students') {
      return [
        { value: 'all', label: 'All Students', icon: <FiUsersAll className="w-4 h-4" /> },
        ...filterOptions.studentCategories.map(cat => ({
          value: cat.value,
          label: cat.label,
          icon: cat.value === 'academy' ? <GiTeacher className="w-4 h-4" /> : <MdLocalLibrary className="w-4 h-4" />
        }))
      ];
    } else if (formData.category === 'staff') {
      return [
        { value: 'all', label: 'All Staff', icon: <BsPersonWorkspace className="w-4 h-4" /> },
        ...filterOptions.staffRoles.map(role => ({
          value: role.value,
          label: role.label,
          icon: <BsPersonBadge className="w-4 h-4" />
        }))
      ];
    }
    return [];
  };

  const categoryOptions = getCategoryOptions();
  const subCategoryOptions = getSubCategoryOptions();
  const selectedType = dataTypes.find(t => t.value === formData.dataType);
  const selectedFormat = formats.find(f => f.value === formData.format);
  const selectedDateRange = dateRangeOptions.find(d => d.value === formData.dateRange);

  const showStatusFilter = formData.dataType !== 'payments';
  const showPaymentStatusFilter = formData.dataType === 'payments';
  const showCategoryFilter = true;
  const showSubCategoryFilter = (formData.dataType === 'payments' || formData.dataType === 'attendance') &&
                                formData.category !== 'all' && formData.category !== 'all';
  const showDepartmentFilter = formData.dataType === 'staff' ||
                               (formData.dataType === 'payments' && formData.category === 'staff') ||
                               (formData.dataType === 'attendance' && formData.category === 'staff');
  const showCourseFilter = formData.dataType === 'students' || formData.dataType === 'courses';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FiDownload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <FiFile className="w-4 h-4" /> Export with filters
            </p>
          </div>
        </div>
        <button
          onClick={fetchFilterOptions}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          {fetchingFilters ? <Loader type="inline" size="small" /> : <FiRefreshCw className="w-4 h-4" />}
          Refresh Filters
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiFilter className="w-4 h-4" /> Select Data Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dataTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    dataType: type.value,
                    category: 'all',
                    subCategory: 'all',
                    department: 'all',
                    course: 'all',
                    status: 'all'
                  })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.dataType === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${type.color}-100 text-${type.color}-600`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiCalendar className="w-4 h-4" /> Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {dateRangeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({...formData, dateRange: opt.value})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.dateRange === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.icon}
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Picker */}
          {showDatePicker && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => setFormData({...formData, startDate: date})}
                  selectsStart
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholderText="Select start date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => setFormData({...formData, endDate: date})}
                  selectsEnd
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  minDate={formData.startDate}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholderText="Select end date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          {showStatusFilter && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiUserCheck className="w-4 h-4" /> Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Status Filter */}
          {showPaymentStatusFilter && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiCreditCard className="w-4 h-4" /> Payment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                {paymentStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          {showCategoryFilter && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiGrid className="w-4 h-4" /> Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value, subCategory: 'all'})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                disabled={fetchingFilters}
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sub-Category Filter */}
          {showSubCategoryFilter && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {formData.category === 'students' ? <GiTeacher className="w-4 h-4" /> : <BsPersonBadge className="w-4 h-4" />}
                {formData.category === 'students' ? 'Student Category' : 'Staff Role'}
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                disabled={fetchingFilters}
              >
                {subCategoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Department Filter - ONLY FOR STAFF */}
          {showDepartmentFilter && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <BsBuilding className="w-4 h-4" /> Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                disabled={fetchingFilters}
              >
                {departmentOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Course Filter - FROM USER MODEL */}
          {showCourseFilter && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiBookOpen className="w-4 h-4" /> Course
              </label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                disabled={fetchingFilters}
              >
                {courseOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiFileText className="w-4 h-4" /> Export Format
            </label>
            <div className="flex flex-wrap gap-3">
              {formats.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormData({...formData, format: f.value})}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.format === f.value
                      ? `border-${f.color}-500 bg-${f.color}-50 text-${f.color}-700`
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-${f.color}-600`}>{f.icon}</span>
                  <span className="font-medium text-sm">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || fetchingFilters}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader type="inline" size="small" />
                Processing...
              </>
            ) : (
              <>
                <FiDownload className="w-5 h-5" />
                Generate Export
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { icon: <BsShieldCheck className="w-5 h-5" />, label: 'Secure', desc: 'Encrypted transfer', color: 'blue' },
          { icon: <BsClockHistory className="w-5 h-5" />, label: 'Fast', desc: '1-24 hours', color: 'green' },
          { icon: <FiFile className="w-5 h-5" />, label: 'Formats', desc: 'CSV, Excel, PDF', color: 'purple' },
          { icon: <MdOutlineWarning className="w-5 h-5" />, label: 'Limit', desc: '50k records', color: 'yellow' }
        ].map((item, i) => (
          <div key={i} className={`bg-${item.color}-50 rounded-xl p-4 flex items-center gap-3`}>
            <div className={`p-2 bg-${item.color}-100 rounded-lg text-${item.color}-600`}>{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current Selection Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Data:</span>
            <span className="text-sm font-medium capitalize flex items-center gap-1">
              <span className={`p-1 rounded ${selectedType?.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                {selectedType?.icon}
              </span>
              {selectedType?.label}
            </span>
          </div>

          {formData.status !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full ${
                formData.status === 'active' ? 'bg-green-100 text-green-700' :
                formData.status === 'inactive' ? 'bg-red-100 text-red-700' :
                formData.status === 'paid' ? 'bg-green-100 text-green-700' :
                formData.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {formData.status}
              </span>
            </div>
          )}

          {formData.category !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="text-sm font-medium flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {formData.category}
              </span>
            </div>
          )}

          {formData.subCategory && formData.subCategory !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sub Category:</span>
              <span className="text-sm font-medium flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                {formData.subCategory}
              </span>
            </div>
          )}

          {formData.department !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Dept:</span>
              <span className="text-sm font-medium flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {formData.department}
              </span>
            </div>
          )}

          {formData.course !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Course:</span>
              <span className="text-sm font-medium flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                {formData.course}
              </span>
            </div>
          )}

          {formData.dateRange !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Date:</span>
              <span className="text-sm font-medium flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                <FiCalendar className="w-3 h-3" /> {selectedDateRange?.label}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Format:</span>
            <span className="text-sm font-medium capitalize flex items-center gap-1">
              <span className={`p-1 rounded ${selectedFormat?.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {selectedFormat?.icon}
              </span>
              {selectedFormat?.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;