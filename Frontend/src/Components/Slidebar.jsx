import {
  AcademicCapIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Slidebar() {
  const location = useLocation();
  const user = useSelector((state) => state.currentUser);
  const loggedIn = useSelector((state) => state.loggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
    } catch (e) {}
    dispatch(logout());
    window.location.href = '/login';
  };

  const isActiveLink = (path) => location.pathname === path;

  const navLinks = [
    !loggedIn && { to: '/', label: 'Home' },
    !loggedIn && { to: '/login', label: 'Login' },
    loggedIn && { to: '/dashboard', label: 'Dashboard' },
    loggedIn && { to: '/events', label: 'Events' },
    loggedIn && { to: '/meeting', label: 'Meetings' },
    loggedIn && (user?.role === 'alumni' || user?.role === 'student') && { to: '/posts', label: 'Posts' },
    loggedIn && (user?.role === 'collegeadmin' || user?.role === 'admin') && { to: '/bulk-upload', label: 'Bulk Upload' },
    loggedIn && user?.role === 'admin' && { to: '/user-management', label: 'User Approval' },
    loggedIn && (user?.role === 'admin' || user?.role === 'collegeadmin') && { to: '/user-management', label: 'Users' },
    loggedIn && (user?.role === 'admin' || user?.role === 'collegeadmin') && { to: '/branch-manager-assignment', label: 'Managers' },
    loggedIn && (user?.role === 'admin' || user?.role === 'collegeadmin' || user?.role === 'professor') && { to: '/student-management', label: 'Students' },
    loggedIn && user?.role === 'professor' && { to: '/professor-student-approval', label: 'Approvals' },
  ].filter(Boolean);

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col py-6 px-4">
      {/* Logo/Brand */}
      <div className="flex items-center mb-8 px-2">
        <AcademicCapIcon className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-2xl font-bold text-gray-800 tracking-tight select-none">
          Alumni Connect
        </span>
      </div>
      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={classNames(
              isActiveLink(to)
                ? 'bg-blue-100 text-blue-700'
                : 'text-neutral-700 hover:text-blue-700 hover:bg-blue-50',
              'w-full flex items-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      {/* User Info and Sign Out at the bottom */}
      {loggedIn && (
        <div className="mt-8 md:mt-0 flex flex-col gap-2">
          <div className="flex items-center bg-blue-50 rounded-lg px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-600" />
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
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}