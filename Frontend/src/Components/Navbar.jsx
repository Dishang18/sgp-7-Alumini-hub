import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import apiClient from '../config/apiClient';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUser);
  const loggedIn = useSelector((state) => state.loggedIn);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (e) {}
    dispatch(logout());
    window.location.href = '/login';
  };

  const isActiveLink = (path) => location.pathname === path;

  const navLinks = [
    !loggedIn && { to: '/', label: 'Home' },
    !loggedIn && { to: '/about', label: 'About' },
    loggedIn && { to: '/dashboard', label: 'Dashboard' },
    loggedIn && { to: '/event', label: 'Events' },
    loggedIn && { to: '/meeting', label: 'Meetings' },
    loggedIn && (user?.role === 'alumni' || user?.role === 'student') && { to: '/posts', label: 'Posts' },
    loggedIn && (user?.role === 'collegeadmin' || user?.role === 'admin') && { to: '/bulkupload', label: 'Bulk Upload' },
    loggedIn && user?.role === 'admin' && { to: '/user-approval', label: 'User Approval' },
    loggedIn && (user?.role === 'admin' || user?.role === 'collegeadmin') && { to: '/user-management', label: 'Users' },
    loggedIn && (user?.role === 'admin' || user?.role === 'collegeadmin') && { to: '/branch-manager-assignment', label: 'Managers' },
    loggedIn && (user?.role === 'admin' || user?.role === 'collegeadmin' || user?.role === 'professor') && { to: '/student-management', label: 'Students' },
    loggedIn && user?.role === 'professor' && { to: '/professor-student-approval', label: 'Approvals' },
  ].filter(Boolean);

  // Sidebar link style
  const navLinkClass = (path) =>
    classNames(
      isActiveLink(path)
        ? 'bg-blue-100 text-blue-700'
        : 'text-neutral-700 hover:text-blue-700 hover:bg-blue-50',
      'w-full flex items-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200'
    );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 py-6 px-4">
        <div className="flex items-center mb-8 px-2">
          <AcademicCapIcon className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-800 tracking-tight select-none">
            Alumni Connect
          </span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={navLinkClass(to)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          {!loggedIn ? (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="text-neutral-700 hover:text-blue-700 px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Menu as="div" className="relative">
                <Menu.Button className="w-full flex items-center bg-blue-50 rounded-lg px-4 py-2 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3 text-left flex-1">
                    <div className="text-base font-medium text-gray-800 truncate">
                      {(user?.firstName || user?.lastName)
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : (user?.adminName || user?.email)}
                    </div>
                    <div className="text-xs text-blue-700 capitalize">{user?.role}</div>
                  </div>
                  <ChevronDownIcon className="ml-2 h-4 w-4 text-blue-400" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => navigate('/profile')}
                            className={classNames(
                              active ? 'bg-blue-50' : '',
                              'flex items-center w-full px-4 py-2 text-base text-gray-700'
                            )}
                          >
                            <UserIcon className="mr-3 h-4 w-4" />
                            Your Profile
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => navigate('/settings')}
                            className={classNames(
                              active ? 'bg-blue-50' : '',
                              'flex items-center w-full px-4 py-2 text-base text-gray-700'
                            )}
                          >
                            <Cog6ToothIcon className="mr-3 h-4 w-4" />
                            Settings
                          </button>
                        )}
                      </Menu.Item>
                      <div className="border-t border-blue-100"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-blue-50' : '',
                              'flex items-center w-full px-4 py-2 text-base text-gray-700'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}
        </div>
      </aside>

      {/* Topbar for mobile */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Disclosure as="nav" className="md:hidden bg-white border-b border-gray-200 shadow-sm">
          {({ open }) => (
            <>
              <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-2xl font-bold text-gray-800 tracking-tight select-none">
                    Alumni Connect
                  </span>
                </div>
                {/* Hamburger menu at right of brand */}
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-lg text-blue-400 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <Disclosure.Panel>
                <nav className="flex flex-col gap-2 px-4 py-2 bg-white border-t border-gray-200">
                  {navLinks.map(({ to, label }) => (
                    <Disclosure.Button
                      key={to}
                      as={Link}
                      to={to}
                      className="w-full text-left px-4 py-2 rounded-lg text-base font-medium text-neutral-700 hover:text-blue-700 hover:bg-blue-50 transition"
                    >
                      {label}
                    </Disclosure.Button>
                  ))}
                  <div className="mt-4 flex flex-col gap-2">
                    {!loggedIn ? (
                      <>
                        <Disclosure.Button
                          as={Link}
                          to="/login"
                          className="w-full text-left px-4 py-2 rounded-lg text-base font-medium text-neutral-700 hover:text-blue-700 hover:bg-blue-50 transition"
                        >
                          Sign In
                        </Disclosure.Button>
                        <Disclosure.Button
                          as={Link}
                          to="/register"
                          className="w-full text-left px-4 py-2 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          Get Started
                        </Disclosure.Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center px-2 py-2">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-base font-medium text-gray-800">
                              {(user?.firstName || user?.lastName)
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : (user?.adminName || user?.email)}
                            </div>
                            <div className="text-sm text-blue-700 capitalize">{user?.role}</div>
                          </div>
                        </div>
                        <Disclosure.Button
                          as="button"
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 rounded-lg text-base font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          Sign out
                        </Disclosure.Button>
                      </>
                    )}
                  </div>
                </nav>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        {/* Main content goes here */}
        <main className="flex-1">{/* Your routed pages/components */}</main>
      </div>
    </div>
  );
}