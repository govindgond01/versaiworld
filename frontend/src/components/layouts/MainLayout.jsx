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
    <div className="min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        {/* left side sidebar */}
        <div className="hidden md:block fixed left-8 w-[300px] h-[calc(100vh-4rem)] bg-white z-10 border-t border-zinc-200">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 md:ml-[300px] min-h-[calc(100vh-4rem)]">
          <div className="pt-2 px-4 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout