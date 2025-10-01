import React, { useState } from 'react'
import Slidebar from './Components/Slidebar'
import { Outlet } from 'react-router-dom'
import Footer from './Components/Footer'
import { ToastContainer } from 'react-toastify'
import { useLenis } from './hooks/useLenis'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

function Layout() {
  useLenis();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <ToastContainer />
      {/* Topbar for mobile */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 h-16 px-4">
        <div className="text-xl font-bold text-blue-700 flex items-center gap-2">
          <span>Alumni Connect</span>
        </div>
        <button
          className="p-2 rounded-md text-blue-700 hover:bg-blue-50"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-lg z-50">
            <button
              className="absolute top-4 right-4 p-2 rounded-md text-blue-700 hover:bg-blue-50"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <Slidebar />
          </div>
        </div>
      )}
      <div className="flex min-h-screen">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex">
          <Slidebar />
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Outlet />
          <Footer />
        </div>
      </div>
    </>
  )
}

export default Layout