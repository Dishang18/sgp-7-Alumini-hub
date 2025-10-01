/**
 * Responsive Home Page
 * - Professional, modern palette: off-white, cool gray, deep blue, accent
 * - Subtle background gradient for visual interest
 * - Scalable units, accessible contrast
 * - Responsive grid for features/sections
 * - Semantic HTML
 */

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100">
      <section className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-700">Alumni Connect</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-6">
          A modern hub for alumni, students, and faculty to connect, share, and grow together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium shadow hover:bg-blue-800 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-white border border-blue-700 text-blue-700 px-6 py-3 rounded-lg text-base font-medium shadow hover:bg-blue-50 transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100">
          <span className="text-blue-600 text-3xl mb-2">🎓</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Stay Connected</h2>
          <p className="text-gray-500 text-base text-center">
            Reconnect with classmates, professors, and alumni from all years.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100">
          <span className="text-blue-600 text-3xl mb-2">💼</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Opportunities</h2>
          <p className="text-gray-500 text-base text-center">
            Discover jobs, internships, and mentorship from your alumni network.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100">
          <span className="text-blue-600 text-3xl mb-2">📅</span>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Events & News</h2>
          <p className="text-gray-500 text-base text-center">
            Stay updated with campus events, reunions, and alumni news.
          </p>
        </div>
      </section>
    </main>
  );
}