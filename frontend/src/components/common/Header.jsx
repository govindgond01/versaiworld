import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from "../../assets/logo.webp";
import { 
  FiSearch, FiMenu, FiBell, FiUser, 
  FiLogOut, FiSettings, FiHelpCircle,
  FiChevronDown, FiBook, FiDollarSign,
  FiCalendar, FiUsers
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    unreadCount: 0
  });
  
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    fetchNotificationCount();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 1) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/me');

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('userName', res.data.user.name);
        localStorage.setItem('userRole', res.data.user.role);
        if (res.data.user.studentCategory) {
          localStorage.setItem('studentCategory', res.data.user.studentCategory);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/notifications/my?limit=1');

      setNotifications(prev => ({
        ...prev,
        unreadCount: res.data.unreadCount || 0
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    
    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get(`/search?q=${searchTerm}`);

      setSearchResults(res.data.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleNotificationClick = () => {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      navigate('/admin-dashboard/notifications');
    } else if (role === 'staff') {
      navigate('/staff-dashboard/notifications');
    } else {
      const category = localStorage.getItem('studentCategory');
      navigate(`/${category}-dashboard/notifications`);
    }
  };

  // 👇 MODIFIED: Toggle function
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Role-based navigation
  const handleProfileClick = () => {
    setShowDropdown(false);
    const role = localStorage.getItem('userRole');
    const category = localStorage.getItem('studentCategory');
    
    if (role === 'admin') {
      navigate('/admin-dashboard/profile');
    } else if (role === 'staff') {
      navigate('/staff-dashboard/profile');
    } else if (role === 'student') {
      if (category === 'academy') {
        navigate('/academy-dashboard/profile');
      } else if (category === 'library') {
        navigate('/library-dashboard/profile');
      }
    }
  };

  const handleSettingsClick = () => {
    setShowDropdown(false);
    const role = localStorage.getItem('userRole');
    const category = localStorage.getItem('studentCategory');
    
    if (role === 'admin') {
      navigate('/admin-dashboard/settings');
    } else if (role === 'staff') {
      navigate('/staff-dashboard/settings');
    } else if (role === 'student') {
      if (category === 'academy') {
        navigate('/academy-dashboard/settings');
      } else if (category === 'library') {
        navigate('/library-dashboard/settings');
      }
    }
  };

  const handleHelpClick = () => {
    setShowDropdown(false);
    const role = localStorage.getItem('userRole');
    const category = localStorage.getItem('studentCategory');
    
    if (role === 'admin') {
      navigate('/admin-dashboard/help');
    } else if (role === 'staff') {
      navigate('/staff-dashboard/help');
    } else if (role === 'student') {
      if (category === 'academy') {
        navigate('/academy-dashboard/help');
      } else if (category === 'library') {
        navigate('/library-dashboard/help');
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserRoleDisplay = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'staff') return user.staffRole || 'Staff';
    if (user.studentCategory === 'academy') return 'Academy Student';
    if (user.studentCategory === 'library') return 'Library Student';
    return 'User';
  };

  const getSearchPlaceholder = () => {
    const role = localStorage.getItem('userRole');
    const category = localStorage.getItem('studentCategory');
    
    if (role === 'admin') return 'Search users, students, staff...';
    if (role === 'staff') return 'Search salary, attendance, students...';
    if (category === 'academy') return 'Search fees, courses, attendance...';
    if (category === 'library') return 'Search books, membership, fees...';
    return 'Search...';
  };

  const getResultIcon = (type) => {
    switch(type) {
      case 'user': return <FiUsers className="w-4 h-4" />;
      case 'payment':
      case 'salary':
      case 'fee': return <FiDollarSign className="w-4 h-4" />;
      case 'attendance': return <FiCalendar className="w-4 h-4" />;
      case 'book': return <FiBook className="w-4 h-4" />;
      default: return <FiSearch className="w-4 h-4" />;
    }
  };

  // ✅ FIXED FUNCTION - SIRF YEH CHANGE KIYA HAI
  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    
    // CASE 1: Cloudinary object
    if (typeof user.profileImage === 'object' && user.profileImage !== null) {
      if (user.profileImage.secure_url) {
        return user.profileImage.secure_url;
      }
      if (user.profileImage.url) {
        return user.profileImage.url;
      }
    }
    
    // CASE 2: String (local ya cloudinary URL)
    if (typeof user.profileImage === 'string') {
      if (user.profileImage.startsWith('http')) {
        return user.profileImage;
      }
      return `http://localhost:5000/uploads/${user.profileImage}`;
    }
    
    return null;
  };

  return (
    <div className='bg-white fixed top-0 z-50 w-full shadow-sm'>
      <div className='h-16'>
        <div className='flex h-full items-center'>
          {/* Logo Section */}
          <div className='w-[280px] h-full border-r border-zinc-200 hidden md:flex items-center pl-8'>
            <img className='h-10' src={logoImg} alt="Logo" />
          </div>

          {/* Mobile Left */}
          <div className='flex items-center md:hidden pl-4'>
            <button
              onClick={toggleSidebar}
              className='p-2 rounded-lg hover:bg-zinc-100 mr-2'
            >
              <FiMenu className='w-6 h-6 text-gray-700' />
            </button>
            <img className='h-8' src={logoImg} alt="Logo" />
          </div>

          <div className='flex flex-1 items-center justify-between px-4 md:px-6 lg:px-8'>
            {/* Search Bar */}
            <div className='flex-1 max-w-xl relative'>
              <div className='relative'>
                <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  placeholder={getSearchPlaceholder()}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 pl-10 text-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-sm"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                      onClick={() => {
                        navigate(result.url);
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className={`p-2 rounded-lg ${
                        result.type === 'user' ? 'bg-blue-100' :
                        result.type === 'payment' || result.type === 'salary' ? 'bg-green-100' :
                        result.type === 'attendance' ? 'bg-yellow-100' :
                        result.type === 'book' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{result.title}</p>
                        <p className="text-xs text-gray-500">{result.subtitle}</p>
                      </div>
                      {result.date && (
                        <span className="text-xs text-gray-400">
                          {new Date(result.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className='flex items-center gap-3 ml-4'>
              {/* Notification Bell */}
              <button 
                onClick={handleNotificationClick}
                className='relative p-2 rounded-lg hover:bg-zinc-100 transition'
              >
                <FiBell className='w-5 h-5 text-gray-700' />
                {notifications.unreadCount > 0 && (
                  <span className='absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1'>
                    {notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className='relative'>
                {/* 👇 ADDED: ref for button */}
                <button
                  ref={buttonRef}
                  onClick={toggleDropdown}
                  className='flex items-center gap-2 hover:bg-zinc-50 rounded-lg p-1 transition'
                >
                  <div className='flex items-center'>
                    {getProfileImageUrl() ? (
                      <img 
                        className='h-10 w-10 rounded-full border-2 border-gray-200 object-cover' 
                        src={getProfileImageUrl()} 
                        alt={user?.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<div class="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium border-2 border-gray-200">${getInitials(user?.name)}</div>`;
                        }}
                      />
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium border-2 border-gray-200'>
                        {user ? getInitials(user.name) : 'U'}
                      </div>
                    )}
                  </div>
                  <div className='hidden md:block text-left'>
                    <p className='text-sm font-medium text-gray-900'>{user?.name || 'Loading...'}</p>
                    <p className='text-xs text-gray-500'>{getUserRoleDisplay()}</p>
                  </div>
                  <FiChevronDown className='w-4 h-4 text-gray-500 hidden md:block' />
                </button>

                {/* 👇 ADDED: ref for dropdown */}
                {showDropdown && (
                  <div 
                    ref={dropdownRef}
                    className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'
                  >
                    <div className='px-4 py-3 border-b border-gray-200'>
                      <p className='font-medium text-gray-900'>{user?.name}</p>
                      <p className='text-sm text-gray-500'>{user?.email}</p>
                    </div>

                    <div className='py-2'>
                      {/* Profile - Role Based */}
                      <button
                        onClick={handleProfileClick}
                        className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3'
                      >
                        <FiUser className='w-4 h-4 text-gray-500' />
                        <span>My Profile</span>
                      </button>

                      {/* Settings - Role Based */}
                      <button
                        onClick={handleSettingsClick}
                        className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3'
                      >
                        <FiSettings className='w-4 h-4 text-gray-500' />
                        <span>Settings</span>
                      </button>

                      {/* Help - Role Based */}
                      <button
                        onClick={handleHelpClick}
                        className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3'
                      >
                        <FiHelpCircle className='w-4 h-4 text-gray-500' />
                        <span>Help & Support</span>
                      </button>
                    </div>

                    <div className='border-t border-gray-200 pt-2'>
                      <button
                        onClick={handleLogout}
                        className='w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600'
                      >
                        <FiLogOut className='w-4 h-4' />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;