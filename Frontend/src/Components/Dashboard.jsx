
import { Navigate } from "react-router-dom";
import { getUserData } from "../services/authService";
import { getLoggedIn } from "../services/authService";
import { UserCircleIcon, EnvelopeIcon, UserGroupIcon } from '@heroicons/react/24/solid';

function Dashboard() {
  const loggedin = getLoggedIn();
  if (!loggedin) return <Navigate to="/login" />;
  const { role, email, firstName, lastName, adminName } = getUserData();
  let displayName = '';
  if (role === "admin") {
    displayName = adminName || email;
  } else if (firstName || lastName) {
    displayName = `${firstName || ''} ${lastName || ''}`.trim();
  } else {
    displayName = email;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center animate-fade-in">
        <UserCircleIcon className="h-20 w-20 text-indigo-400 mb-4" />
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">Welcome, {displayName}!</h1>
        <div className="w-full mt-4">
          <div className="flex items-center mb-2">
            <EnvelopeIcon className="h-5 w-5 text-indigo-400 mr-2" />
            <span className="text-gray-700 font-medium">{email}</span>
          </div>
          <div className="flex items-center mb-2">
            <UserGroupIcon className="h-5 w-5 text-indigo-400 mr-2" />
            <span className="text-gray-700 font-medium capitalize">Role: {role}</span>
          </div>
        </div>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Explore the navigation bar to access all features.
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
