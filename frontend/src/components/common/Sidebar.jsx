import { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome, FiTrendingUp, FiAward, FiBookOpen, FiBook, FiClock,
  FiHeart, FiStar, FiUser, FiCreditCard, FiSearch, FiCalendar,
  FiHelpCircle, FiUsers, FiSettings, FiChevronDown,
  FiLogOut, FiBell, FiX
} from 'react-icons/fi';
import { MdLocalLibrary, MdEvent, MdGroups, MdDashboard, MdAnalytics } from 'react-icons/md';
import { FaFileAlt, FaUserTie, FaRupeeSign, FaUserGraduate } from 'react-icons/fa';
import { HiDatabase } from 'react-icons/hi';
import { GiTeacher } from 'react-icons/gi';
import { CiCalendar } from "react-icons/ci";
import logoImg from "../../assets/logo.webp";

import adminMenu from '../Data/adminMenu';
import academyMenu from '../Data/academyMenu';
import staffMenu from '../Data/staffMenu';
import libraryMenu from '../Data/libraryMenu';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const userRole = localStorage.getItem('role') || 'user';
  const studentCategory = localStorage.getItem('studentCategory') || '';
  const logoutRef = useRef(false);

  const getMenuData = () => {
    if (userRole === 'admin') return adminMenu;
    if (userRole === 'staff') return staffMenu;
    if (userRole === 'student') {
      if (studentCategory === 'academy') return academyMenu;
      if (studentCategory === 'library') return libraryMenu;
    }
    return [];
  };

  const menuData = getMenuData();

  const iconMap = {
    dashboard: <MdDashboard className="w-5 h-5" />,
    home: <FiHome className="w-5 h-5" />,
    trending: <FiTrendingUp className="w-5 h-5" />,
    analytics: <MdAnalytics className="w-5 h-5" />,
    report: <FaFileAlt className="w-5 h-5" />,
    adminreport: <FaFileAlt className="w-5 h-5" />,
    attendance: <CiCalendar className="w-5 h-5" />,
    award: <FiAward className="w-5 h-5" />,
    star: <FiStar className="w-5 h-5" />,
    bookOpen: <FiBookOpen className="w-5 h-5" />,
    book: <FiBook className="w-5 h-5" />,
    library: <MdLocalLibrary className="w-5 h-5" />,
    clock: <FiClock className="w-5 h-5" />,
    calendar: <FiCalendar className="w-5 h-5" />,
    event: <MdEvent className="w-5 h-5" />,
    heart: <FiHeart className="w-5 h-5" />,
    user: <FiUser className="w-5 h-5" />,
    users: <FiUsers className="w-5 h-5" />,
    groups: <MdGroups className="w-5 h-5" />,
    adminstaff: <FaUserTie className="w-5 h-5" />,
    teacher: <GiTeacher className="w-5 h-5" />,
    student: <FaUserGraduate className="w-5 h-5" />,
    creditCard: <FiCreditCard className="w-5 h-5" />,
    rupees: <FaRupeeSign className="w-5 h-5" />,
    settings: <FiSettings className="w-5 h-5" />,
    setting: <FiSettings className="w-5 h-5" />,
    search: <FiSearch className="w-5 h-5" />,
    bell: <FiBell className="w-5 h-5" />,
    help: <FiHelpCircle className="w-5 h-5" />,
    database: <HiDatabase className="w-5 h-5" />,
  };

  const [openMenus, setOpenMenus] = useState({});

  // Compute which menus should be open based on current path
  const initialOpenMenus = useMemo(() => {
    const newOpen = {};
    menuData.forEach(section => {
      section.items.forEach(item => {
        if (item.type === "dropdown" && item.subItems) {
          const hasActive = item.subItems.some(sub => location.pathname === sub.path);
          if (hasActive) newOpen[item.key] = true;
        }
      });
    });
    return newOpen;
  }, [location.pathname, menuData]);

  // Sync state when path changes
  useEffect(() => {
    setOpenMenus(initialOpenMenus);
  }, [initialOpenMenus]);

  const toggleMenu = (key) => setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    // Prevent multiple rapid logout attempts
    if (logoutRef.current) return;
    logoutRef.current = true;

    localStorage.clear();
    window.location.replace('/login');
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const isAnySubItemActive = (item) => {
    if (item.type === "dropdown" && item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path);
    }
    return false;
  };

  if (!menuData || menuData.length === 0) return null;

  const activeClass = "gradient-primary text-white";

  if (isOpen === undefined) {
    return (
      <div className="h-screen bg-white border-r border-gray-200 overflow-y-auto">
        <div className="pt-2 pr-2 pb-20">
          {menuData.map((section, idx) => (
            <div key={idx} className="mb-4">
              {section.sectionTitle && (
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.sectionTitle}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    {item.type === "dropdown" ? (
                      <div>
                        <button
                          onClick={() => toggleMenu(item.key)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200
                            ${isAnySubItemActive(item) || openMenus[item.key] ? activeClass : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{iconMap[item.icon]}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMenus[item.key] ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${openMenus[item.key] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                          {item.subItems?.map((sub, i) => (
                            <NavLink
                              key={i}
                              to={sub.path}
                              onClick={handleNavClick}
                              className={({ isActive }) =>
                                `block px-3 py-2 ml-6 rounded-lg text-sm transition-all duration-200
                                ${isActive ? activeClass : 'text-gray-600 hover:bg-gray-100'}`
                              }
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${isActive ? activeClass : 'text-gray-600 hover:bg-gray-100'}`
                        }
                      >
                        <span className="text-lg">{iconMap[item.icon]}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium shadow-md text-gray-600 hover:bg-gray-100"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>

          <div className="mt-4 px-3 py-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-gray-800 capitalize">
              {userRole} {studentCategory && `(${studentCategory})`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <div className={`
        fixed top-0 left-0 h-screen w-[300px] bg-white z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:hidden overflow-y-auto
      `}>
        <div className="px-4 pt-4 border-b border-gray-100 flex justify-between items-center">
          <img src={logoImg} className="h-8 w-auto" alt="logo" />
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="py-4 px-3 pb-6">
          {menuData.map((section, idx) => (
            <div key={idx} className="mb-4">
              {section.sectionTitle && (
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.sectionTitle}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    {item.type === "dropdown" ? (
                      <div>
                        <button
                          onClick={() => toggleMenu(item.key)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200
                            ${isAnySubItemActive(item) || openMenus[item.key] ? activeClass : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{iconMap[item.icon]}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMenus[item.key] ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${openMenus[item.key] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                          {item.subItems?.map((sub, i) => (
                            <NavLink
                              key={i}
                              to={sub.path}
                              onClick={handleNavClick}
                              className={({ isActive }) =>
                                `block px-3 py-2 ml-6 rounded-lg text-sm transition-all duration-200
                                ${isActive ? activeClass : 'text-gray-600 hover:bg-gray-100'}`
                              }
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${isActive ? activeClass : 'text-gray-600 hover:bg-gray-100'}`
                        }
                      >
                        <span className="text-lg">{iconMap[item.icon]}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => { handleLogout(); onClose(); }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium shadow-md text-gray-600 hover:bg-gray-100"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>

          <div className="mt-4 px-3 py-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-gray-800 capitalize">
              {userRole} {studentCategory && `(${studentCategory})`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;