import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import apiClient from '../config/apiClient';
import Dropdown from './helper/Dropdown';
import {
  FaHome, FaCalendar, FaBriefcase, FaCommentDots, FaUpload, FaUserTie,
  FaUserGraduate, FaVideo, FaSearch, FaEnvelopeOpenText
} from 'react-icons/fa';

const theme = {
  sidebarBg: 'bg-gradient-to-b from-blue-50 to-blue-100',
  activeBtn: 'bg-blue-700 text-white', // Darker blue for active
  inactiveBtn: 'bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-900',
  border: 'border border-blue-200',
  logoutBtn: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700',
};

const NAV_LINKS = [
  // ...existing NAV_LINKS...
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
  // {
  //   label: 'Student Management',
  //   to: '/student-management',
  //   icon: <FaUserGraduate className="mr-1" />,
  //   roles: ['admin', 'collegeadmin', 'professor'],
  //   loggedIn: true,
  // },
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
];

export default function Slidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(logout());
    navigate('/home');
  };

  return (
    <aside className={`w-64 h-full ${theme.sidebarBg} border-r border-gray-200 flex flex-col py-6 px-4`}>
      {/* Logo/Brand */}
      <div className="flex items-center mb-8 px-2">
  <img src="/logo.png" alt="CharuVerse logo" className="h-8 w-8 rounded-md border-2 border-blue-600 object-contain" loading="lazy" />
        <span className="ml-2 text-2xl font-bold text-gray-800 tracking-tight select-none">
           CharuVerse
        </span>
      </div>
      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {/* Show Home/Register/Login if not logged in */}
        {!loggedIn && (
          <>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg text-base font-medium ${
                  isActive ? theme.activeBtn : theme.inactiveBtn
                }`
              }
            >
              <FaHome className="mr-1" /> Home
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg text-base font-medium ${theme.border} ${
                  isActive ? theme.activeBtn : theme.inactiveBtn
                }`
              }
            >
              Register
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg text-base font-medium ${theme.border} ${
                  isActive ? theme.activeBtn : theme.inactiveBtn
                }`
              }
            >
              Login
            </NavLink>
          </>
        )}
        {/* Show dynamic links for logged in users */}
        {loggedIn && user?.role && (
          <>
            {NAV_LINKS.filter(link => link.loggedIn && link.roles.includes(user.role)).map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive ? theme.activeBtn : theme.inactiveBtn
                  }`
                }
              >
                {link.icon} {link.label}
              </NavLink>
            ))}
            {/* <Dropdown /> */}
          </>
        )}
      </nav>
      {/* User Info */}
      {loggedIn && (
        <div className="mt-8 flex flex-col gap-2">
            <div className="flex items-center bg-blue-50 rounded-lg px-4 py-3">
            <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center overflow-hidden border-2 border-blue-600">
              <img src="/logo.png" alt="avatar" className="h-8 w-8 rounded-md object-cover" loading="lazy" />
            </div>
            <div className="ml-3 min-w-0">
              <div className="text-base font-medium text-gray-800 truncate max-w-[8rem] md:max-w-[10rem]">
                {(user?.firstName || user?.lastName)
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : (user?.adminName || user?.email)}
              </div>
              <div className="text-xs text-blue-700 capitalize">{user?.role}</div>
            </div>
          </div>
        </div>
      )}
      {/* Logout Button at the end */}
      {loggedIn && (
        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-base font-medium transition ${theme.logoutBtn}`}
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}