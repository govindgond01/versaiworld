import React, { useState } from 'react'
import Header from '../common/Header'
import Sidebar from '../common/Sidebar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed left-0 w-[300px] h-[calc(100vh-4rem)] bg-white z-10 border-r border-zinc-200">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 lg:ml-[300px] min-h-[calc(100vh-4rem)] bg-gray-100">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout