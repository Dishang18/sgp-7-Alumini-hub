import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const user = useSelector((state) => state.currentUser);

  // Prefer full name, fallback to adminName, then email, then "User"
  const displayName =
    (user?.firstName || user?.lastName)
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : (user?.adminName || user?.email || "User");

  // Greeting message
  const greeting = `Welcome${displayName ? `, ${displayName}` : ""}!`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 px-4 py-8 flex flex-col items-center">
      {/* Dashboard Heading */}
      <section className="w-full max-w-4xl text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-1">
          Dashboard
        </h1>
        <p className="text-gray-500 text-lg">
          Quick access to your alumni hub features.
        </p>
      </section>

      {/* Greeting & User Info Card */}
      <section className="w-full max-w-4xl flex justify-center mb-10">
        <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-lg border-0 px-8 py-6 w-full md:w-2/3 rounded-2xl relative overflow-hidden">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600 mr-0 md:mr-6 mb-4 md:mb-0 shadow">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-2xl font-semibold text-white mb-1">
              {greeting}
            </div>
            <div className="text-sm text-blue-200 capitalize font-medium">
              {user?.role}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start border border-gray-100">
          <span className="text-blue-600 text-2xl mb-2">📅</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Upcoming Events</h2>
          <p className="text-gray-500 text-base mb-3">
            See what's happening soon in your alumni network.
          </p>
          <Link to="/events" className="text-blue-700 font-medium hover:underline text-sm">
            View Events
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start border border-gray-100">
          <span className="text-blue-600 text-2xl mb-2">💼</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Job Board</h2>
          <p className="text-gray-500 text-base mb-3">
            Explore job and internship opportunities posted by alumni.
          </p>
          <Link to="/jobs" className="text-blue-700 font-medium hover:underline text-sm">
            View Jobs
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start border border-gray-100">
          <span className="text-blue-600 text-2xl mb-2">📝</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Posts & Discussions</h2>
          <p className="text-gray-500 text-base mb-3">
            Join conversations and share updates with your community.
          </p>
          <Link to="/posts" className="text-blue-700 font-medium hover:underline text-sm">
            Go to Posts
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start border border-gray-100">
          <span className="text-blue-600 text-2xl mb-2">👥</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">People</h2>
          <p className="text-gray-500 text-base mb-3">
            Find and connect with alumni, students, and faculty.
          </p>
          <Link to="/search-people" className="text-blue-700 font-medium hover:underline text-sm">
            Search People
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start border border-gray-100">
          <span className="text-blue-600 text-2xl mb-2">📧</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Newsletter</h2>
          <p className="text-gray-500 text-base mb-3">
            Stay informed with the latest news and updates.
          </p>
          <Link to="/newsletter" className="text-blue-700 font-medium hover:underline text-sm">
            Read Newsletter
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start border border-gray-100">
          <span className="text-blue-600 text-2xl mb-2">⚙️</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Settings</h2>
          <p className="text-gray-500 text-base mb-3">
            Manage your profile and account preferences.
          </p>
          <Link to="/profile" className="text-blue-700 font-medium hover:underline text-sm">
            Profile Settings
          </Link>
        </div>
      </section>
    </main>
  );
}