import React from 'react'
import Topbar from './Components/Topbar'
import { Navigate, Outlet } from 'react-router-dom'
import Footer from './Components/Footer'
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify'
import { useLenis } from './hooks/useLenis'

function Layout() {
  const loggedIn = useSelector((state) => state.loggedIn);
  
  // Initialize smooth scrolling
  useLenis();
  
  return (
    <>
      <ToastContainer/>
  
      <Topbar />
      <Outlet />
     

      <Footer />
    </>
  )
}

export default Layout
