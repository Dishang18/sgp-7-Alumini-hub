

import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  BellIcon, 
  XMarkIcon, 
  Bars3Icon, 
  AcademicCapIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUser);
  const loggedIn = useSelector((state) => state.loggedIn);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
    } catch (e) {}
    dispatch(logout());
    window.location.href = '/login';
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path, baseColor = 'blue') => {
    const isActive = isActiveLink(path);
    return classNames(
      isActive 
        ? `bg-${baseColor}-600 text-white` 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200'
    );
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and brand */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Alumni Connect</span>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:ml-8 md:flex md:space-x-1">
                  {!loggedIn ? (
                    <>
                      <Link to="/" className={navLinkClass('/')}>
                        Home
                      </Link>
                      <Link to="/about" className={navLinkClass('/about')}>
                        About
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                        Dashboard
                      </Link>
                      <Link to="/event" className={navLinkClass('/event')}>
                        Events
                      </Link>
                      <Link to="/meeting" className={navLinkClass('/meeting')}>
                        Meetings
                      </Link>
                      
                      {/* Posts section for alumni and students */}
                      {(user?.role === 'alumni' || user?.role === 'student') && (
                        <Link to="/posts" className={navLinkClass('/posts', 'purple')}>
                          Posts
                        </Link>
                      )}
                      
                      {/* Admin sections */}
                      {(user?.role === 'collegeadmin' || user?.role === 'admin') && (
                        <Link to="/bulkupload" className={navLinkClass('/bulkupload')}>
                          Bulk Upload
                        </Link>
                      )}
                      
                      {user?.role === 'admin' && (
                        <Link to="/user-approval" className={navLinkClass('/user-approval')}>
                          User Approval
                        </Link>
                      )}
                      
                      {/* Management sections */}
                      {(user?.role === 'admin' || user?.role === 'collegeadmin') && (
                        <Link to="/user-management" className={navLinkClass('/user-management')}>
                          Users
                        </Link>
                      )}
                      
                      {(user?.role === 'admin' || user?.role === 'collegeadmin') && (
                        <Link to="/branch-manager-assignment" className={navLinkClass('/branch-manager-assignment', 'purple')}>
                          Managers
                        </Link>
                      )}
                      
                      {(user?.role === 'admin' || user?.role === 'collegeadmin' || user?.role === 'professor') && (
                        <Link to="/student-management" className={navLinkClass('/student-management', 'green')}>
                          Students
                        </Link>
                      )}
                      
                      {/* Professor-specific sections */}
                      {user?.role === 'professor' && (
                        <Link to="/professor-student-approval" className={navLinkClass('/professor-student-approval', 'indigo')}>
                          Approvals
                        </Link>
                      )}
                    </>
                  )}
                </nav>
              </div>

              {/* Right side */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                {!loggedIn ? (
                  <div className="flex items-center space-x-3">
                    <Link 
                      to="/login" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button
                      type="button"
                      className="bg-white p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative">
                      <div>
                        <Menu.Button className="bg-white flex items-center text-sm rounded-lg p-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3 text-left">
                            <div className="text-sm font-medium text-gray-900">
                              {(user?.firstName || user?.lastName) 
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                                : (user?.adminName || user?.email)}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                          </div>
                          <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" />
                        </Menu.Button>
                      </div>
                      
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => navigate('/profile')}
                                  className={classNames(
                                    active ? 'bg-gray-50' : '',
                                    'flex items-center w-full px-4 py-2 text-sm text-gray-700'
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
                                    active ? 'bg-gray-50' : '',
                                    'flex items-center w-full px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  <Cog6ToothIcon className="mr-3 h-4 w-4" />
                                  Settings
                                </button>
                              )}
                            </Menu.Item>
                            <div className="border-t border-gray-100"></div>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleLogout}
                                  className={classNames(
                                    active ? 'bg-gray-50' : '',
                                    'flex items-center w-full px-4 py-2 text-sm text-gray-700'
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

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
          {/* Mobile Navigation Panel */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {!loggedIn ? (
                <>
                  <Disclosure.Button
                    as={Link}
                    to="/"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    Home
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/about"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    About
                  </Disclosure.Button>
                  <div className="pt-4 border-t border-gray-200">
                    <Disclosure.Button
                      as={Link}
                      to="/login"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Sign In
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      to="/register"
                      className="block px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg mt-2"
                    >
                      Get Started
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center px-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-900">
                        {(user?.firstName || user?.lastName) 
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                          : (user?.adminName || user?.email)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2">
                    <Disclosure.Button
                      as={Link}
                      to="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Dashboard
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      to="/event"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Events
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      to="/meeting"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      Meetings
                    </Disclosure.Button>
                    
                    {(user?.role === 'alumni' || user?.role === 'student') && (
                      <Disclosure.Button
                        as={Link}
                        to="/posts"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        Posts
                      </Disclosure.Button>
                    )}
                    
                    {(user?.role === 'collegeadmin' || user?.role === 'admin') && (
                      <Disclosure.Button
                        as={Link}
                        to="/bulkupload"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        Bulk Upload
                      </Disclosure.Button>
                    )}
                    
                    {user?.role === 'admin' && (
                      <Disclosure.Button
                        as={Link}
                        to="/user-approval"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        User Approval
                      </Disclosure.Button>
                    )}
                    
                    {(user?.role === 'admin' || user?.role === 'collegeadmin') && (
                      <Disclosure.Button
                        as={Link}
                        to="/user-management"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        User Management
                      </Disclosure.Button>
                    )}
                    
                    {(user?.role === 'admin' || user?.role === 'collegeadmin') && (
                      <Disclosure.Button
                        as={Link}
                        to="/branch-manager-assignment"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        Branch Managers
                      </Disclosure.Button>
                    )}
                    
                    {(user?.role === 'admin' || user?.role === 'collegeadmin' || user?.role === 'professor') && (
                      <Disclosure.Button
                        as={Link}
                        to="/student-management"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        Student Management
                      </Disclosure.Button>
                    )}
                    
                    {user?.role === 'professor' && (
                      <Disclosure.Button
                        as={Link}
                        to="/professor-student-approval"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        Student Approvals
                      </Disclosure.Button>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;
