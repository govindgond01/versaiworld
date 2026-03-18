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
        <div className="hidden md:block fixed left-0 md:left-6 lg:left-8 w-[300px] h-[calc(100vh-4rem)] bg-white z-10 border-r border-zinc-200">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 md:ml-[324px] lg:ml-[332px] min-h-[calc(100vh-4rem)] bg-gray-100 pr-4 md:pr-6 lg:pr-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MainLayout