import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import logoImg from "../../assets/logo.webp";
import {
  FiSearch, FiMenu, FiBell, FiUser,
  FiSettings, FiHelpCircle,
  FiChevronDown, FiBook, FiDollarSign,
  FiCalendar, FiUsers
} from 'react-icons/fi';
import Loader from './Loader';
import api from '../../services/api';
import useDebouncedNavigation from '../../hooks/useDebouncedNavigation';

const Header = ({ toggleSidebar }) => {
  const debouncedNavigate = useDebouncedNavigation(300);
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  });
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
  const searchTimeoutRef = useRef(null);

  // ============ FIX 1: fetchUserData with useCallback ============
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/auth/me');
      if (res.data?.success) {
        const userData = res.data.user;
        
        // Only update if data actually changed
        setUser(prevUser => {
          if (JSON.stringify(prevUser) === JSON.stringify(userData)) {
            return prevUser;
          }
          return userData;
        });
        
        // Batch localStorage updates
        const updates = {
          user: JSON.stringify(userData),
          userId: String(userData.id),
          userName: userData.name,
          userRole: userData.role
        };
        
        if (userData.studentCategory) {
          updates.studentCategory = userData.studentCategory;
        }
        
        // Apply updates efficiently
        Object.entries(updates).forEach(([key, value]) => {
          if (localStorage.getItem(key) !== value) {
            localStorage.setItem(key, value);
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          console.error('Error parsing cached user:', e);
        }
      }
    }
  }, []); // Empty dependency array - runs once

  // ============ FIX 2: fetchNotificationCount with useCallback ============
  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/notifications/my?limit=1');
      
      setNotifications(prev => {
        const newCount = res.data?.unreadCount || 0;
        if (prev.unreadCount === newCount) return prev;
        return { ...prev, unreadCount: newCount };
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []); // Empty dependency array

  // ============ FIX 3: useEffect with proper dependencies ============
  useEffect(() => {
    fetchUserData();
    fetchNotificationCount();
  }, [fetchUserData, fetchNotificationCount]); // Dependencies added

  // Click outside handler - no changes needed
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

  // ============ FIX 4: Search with proper cleanup ============
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); // Only searchTerm dependency

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;

    setSearchLoading(true);
    try {
      const res = await api.get(`/search?q=${searchTerm}`);
      setSearchResults(res.data.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // ============ FIX 5: Remove useCallback wrappers from navigation handlers ============
  const handleNotificationClick = () => {
    const role = localStorage.getItem('role');
    const category = localStorage.getItem('studentCategory');
    
    let path = '/';
    if (role === 'admin') path = '/admin-dashboard/notifications';
    else if (role === 'staff') path = '/staff-dashboard/notifications';
    else if (role === 'student' && category) path = `/${category}-dashboard/notifications`;
    
    debouncedNavigate(path);
  };

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    const role = localStorage.getItem('role');
    const category = localStorage.getItem('studentCategory');

    let path = '/';
    if (role === 'admin') path = '/admin-dashboard/profile';
    else if (role === 'staff') path = '/staff-dashboard/profile';
    else if (role === 'student') {
      if (category === 'academy') path = '/academy-dashboard/profile';
      else if (category === 'library') path = '/library-dashboard/profile';
    }
    
    debouncedNavigate(path);
  };

  const handleSettingsClick = () => {
    setShowDropdown(false);
    const role = localStorage.getItem('role');
    const category = localStorage.getItem('studentCategory');

    let path = '/';
    if (role === 'admin') path = '/admin-dashboard/settings';
    else if (role === 'staff') path = '/staff-dashboard/settings';
    else if (role === 'student') {
      if (category === 'academy') path = '/academy-dashboard/settings';
      else if (category === 'library') path = '/library-dashboard/settings';
    }
    
    debouncedNavigate(path);
  };

  const handleHelpClick = () => {
    setShowDropdown(false);
    const role = localStorage.getItem('role');
    const category = localStorage.getItem('studentCategory');

    let path = '/';
    if (role === 'admin') path = '/admin-dashboard/help';
    else if (role === 'staff') path = '/staff-dashboard/help';
    else if (role === 'student') {
      if (category === 'academy') path = '/academy-dashboard/help';
      else if (category === 'library') path = '/library-dashboard/help';
    }
    
    debouncedNavigate(path);
  };

  // Memoized helper functions
  const getInitials = useCallback((name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  const getUserRoleDisplay = useCallback(() => {
    if (!user) return '';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'staff') return user.staffRole || 'Staff';
    if (user.studentCategory === 'academy') return 'Academy Student';
    if (user.studentCategory === 'library') return 'Library Student';
    return 'User';
  }, [user]);

  const getSearchPlaceholder = useCallback(() => {
    const role = localStorage.getItem('role');
    const category = localStorage.getItem('studentCategory');

    if (role === 'admin') return 'Search users, students, staff...';
    if (role === 'staff') return 'Search salary, attendance, students...';
    if (category === 'academy') return 'Search fees, courses, attendance...';
    if (category === 'library') return 'Search books, membership, fees...';
    return 'Search...';
  }, []);

  const getResultIcon = useCallback((type) => {
    switch(type) {
      case 'user': return <FiUsers className="w-4 h-4" />;
      case 'payment':
      case 'salary':
      case 'fee': return <FiDollarSign className="w-4 h-4" />;
      case 'attendance': return <FiCalendar className="w-4 h-4" />;
      case 'book': return <FiBook className="w-4 h-4" />;
      default: return <FiSearch className="w-4 h-4" />;
    }
  }, []);

  const getProfileImageUrl = useCallback(() => {
    if (!user?.profileImage) return null;

    if (typeof user.profileImage === 'object' && user.profileImage !== null) {
      if (user.profileImage.secure_url) return user.profileImage.secure_url;
      if (user.profileImage.url) return user.profileImage.url;
    }

    if (typeof user.profileImage === 'string' && user.profileImage.includes('cloudinary')) {
      return user.profileImage;
    }

    if (typeof user.profileImage === 'string') {
      const baseURL = globalThis.API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${baseURL}/uploads/${user.profileImage}`;
    }

    return null;
  }, [user]);

  // Rest of the component remains EXACTLY the same - UI untouched
  return (
    <div className='bg-white fixed top-0 z-50 w-full shadow-sm px-2 md:px-6 lg:px-8'>
      <div className='h-16'>
        <div className='flex h-full items-center'>
          <div className='w-[300px] h-full border-r border-zinc-200 hidden md:flex items-center'>
            <img className='h-10' src={logoImg} alt="Logo" />
          </div>

          <div className='flex items-center md:hidden'>
            <button
              onClick={toggleSidebar}
              className='p-2 rounded-lg hover:bg-zinc-100 mr-2'
            >
              <FiMenu className='w-6 h-6 text-gray-700' />
            </button>
            <img className='h-8' src={logoImg} alt="Logo" />
          </div>

          <div className='flex flex-1 items-center justify-end md:justify-between'>
            <div className='flex-1 max-w-xl relative pl-2 hidden md:block'>
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
                    <Loader type="inline" size="small" />
                  </div>
                )}
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                      onClick={() => {
                        debouncedNavigate(result.url);
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className={`p-2 rounded-lg ${result.type === 'user' ? 'bg-blue-100' :
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

            <div className='flex items-center gap-3 ml-4'>
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

              <div className='relative'>
                <button
                  ref={buttonRef}
                  onClick={() => {
                    if (window.innerWidth >= 768) {
                      toggleDropdown();
                    } else {
                      handleProfileClick();
                    }
                  }}
                  className='flex items-center gap-2 hover:bg-zinc-50 rounded-lg p-1 transition'
                >
                  <div className='flex items-center'>
                    {getProfileImageUrl() ? (
                      <img
                        className='h-10 w-10 rounded-full border-2 border-gray-200 object-cover'
                        src={getProfileImageUrl()}
                        alt={user?.name}
                        onError={(event) => {
                          event.target.onerror = null;
                          event.target.style.display = 'none';
                          const parent = event.target.parentNode;
                          parent.innerHTML = `<div class="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium border-2 border-gray-200">${getInitials(user?.name)}</div>`;
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

                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden md:block'
                  >
                    <div className='px-4 py-3 border-b border-gray-200'>
                      <p className='font-medium text-gray-900 text-sm'>{user?.name}</p>
                      <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
                    </div>

                    <div className='py-2'>
                      <button onClick={handleProfileClick} className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3'>
                        <FiUser className='w-4 h-4 text-gray-500' />
                        <span className='text-sm'>My Profile</span>
                      </button>
                      <button onClick={handleSettingsClick} className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3'>
                        <FiSettings className='w-4 h-4 text-gray-500' />
                        <span className='text-sm'>Settings</span>
                      </button>
                      <button onClick={handleHelpClick} className='w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3'>
                        <FiHelpCircle className='w-4 h-4 text-gray-500' />
                        <span className='text-sm'>Help & Support</span>
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