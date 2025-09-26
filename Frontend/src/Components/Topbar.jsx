import React, { useState } from 'react';
import { FaHome, FaCalendar, FaBriefcase, FaNewspaper, FaEnvelope, FaUserTie, FaSearch, FaCommentDots, FaTicketAlt, FaEnvelopeOpenText, FaUserGraduate, FaSignInAlt, FaUpload, FaMeetup, FaVideo, FaBars, FaTimes } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import Dropdown from './helper/Dropdown';


// Permission config for each role
const NAV_LINKS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <FaHome className="mr-1" />,
    roles: ['admin', 'collegeadmin', 'professor', 'alumni', 'student'],
    loggedIn: true,
  },
  {
    label: 'Events',
    to: '/events',
    icon: <FaCalendar className="mr-1" />,
    roles: ['admin', 'collegeadmin', 'professor', 'alumni', 'student'],
    loggedIn: true,
  },
  {
    label: 'Jobs',
    to: '/jobs',
    icon: <FaBriefcase className="mr-1" />,
    roles: ['admin', 'collegeadmin', 'professor', 'alumni', 'student'],
    loggedIn: true,
  },
  {
    label: 'Posts',
    to: '/posts',
    icon: <FaCommentDots className="mr-1" />,
    roles: ['alumni', 'student'],
    loggedIn: true,
  },
  {
    label: 'Bulk Import',
    to: '/bulk-upload',
    icon: <FaUpload className="mr-1" />,
    roles: ['admin', 'collegeadmin'],
    loggedIn: true,
  },
  {
    label: 'User Management',
    to: '/user-management',
    icon: <FaUserTie className="mr-1" />,
    roles: ['admin', 'collegeadmin'],
    loggedIn: true,
  },
  {
    label: 'Professor Management',
    to: '/professor-branch-management',
    icon: <FaUserTie className="mr-1" />,
    roles: ['collegeadmin'],
    loggedIn: true,
  },
  {
    label: 'Student Management',
    to: '/student-management',
    icon: <FaUserGraduate className="mr-1" />,
    roles: ['admin', 'collegeadmin', 'professor'],
    loggedIn: true,
  },
  {
    label: 'Meeting',
    to: '/meeting',
    icon: <FaVideo className="mr-1" />,
    roles: ['admin', 'collegeadmin', 'professor', 'alumni', 'student'],
    loggedIn: true,
  },
  {
    label: 'Search Alumni',
    to: '/search-people',
    icon: <FaSearch className="mr-1" />,
    roles: ['admin', 'collegeadmin', 'professor', 'alumni', 'student'],
    loggedIn: true,
  },
  {
    label: 'Send Mail',
    to: '/send-mail',
    icon: <FaEnvelopeOpenText className="mr-1" />,
    roles: ['admin', 'collegeadmin', 'professor'],
    loggedIn: true,
  },
  // Add more links as needed
];

function Topbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-slate-100 text-black p-4 flex flex-col lg:flex-row justify-between items-center">
      <div className="flex items-center mb-4 lg:mb-0">
        <span> <FaUserTie className="mr-1 h-6 w-8" /></span>
        <h2 className="text-2xl font-extrabold text-gray-800">
          Alumni Connect
        </h2>
      </div>

      {/* Hamburger icon for mobile */}
      <div className="lg:hidden cursor-pointer" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </div>

      <nav className={`lg:flex lg:flex-row lg:space-x-4 font-semibold items-center ${isMobileMenuOpen ? 'flex flex-col' : 'hidden'}`}>
        {/* Show Home/Register/Login if not logged in */}
        {!loggedIn && (
          <>
            <Link to="/home" className="text-sm flex items-center">
              <FaHome className="mr-1" /> Home
            </Link>
            <Link
              to="/register"
              className="border border-black hover:bg-black hover:text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium mt-2 lg:mt-0"
            >
              Login
            </Link>
          </>
        )}
        {/* Show dynamic links for logged in users */}
        {loggedIn && user?.role && (
          <>
            {NAV_LINKS.filter(link => link.loggedIn && link.roles.includes(user.role)).map(link => (
              <Link key={link.to} to={link.to} className="text-sm font-semibold flex items-center">
                {link.icon} {link.label}
              </Link>
            ))}
            <Dropdown />
            <NavLink
              onClick={() => {
                dispatch(logout());
              }}
              className="border border-black hover:bg-black hover:text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
}

export default Topbar;
