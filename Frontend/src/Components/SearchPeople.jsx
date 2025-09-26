import React, { useState, useEffect } from 'react';
import { FaSearch, FaEnvelope, FaLinkedin, FaFacebook, FaBriefcase, FaGraduationCap, FaCalendar } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import axios from 'axios';

const SearchPeople = () => {
  const loggedIn = useSelector((state) => state.loggedIn);
  const currentUser = useSelector((state) => state.currentUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      // For students, allow year and branch-based search
      if (currentUser?.role === 'student') {
        if (selectedYear) params.append('year', selectedYear);
        if (selectedBranch) params.append('branch', selectedBranch);
      } else {
        // For other roles, allow all search parameters
        if (searchQuery) params.append('name', searchQuery);
        if (selectedYear) params.append('year', selectedYear);
        if (selectedBranch) params.append('branch', selectedBranch);
      }
      
      const response = await axios.get(
        `http://localhost:5000/users/alumni?${params.toString()}`,
        { withCredentials: true }
      );
      
      setSearchResults(response.data.data.alumni);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching alumni data');
      console.error('Error fetching alumni:', err);
    }
    setLoading(false);
  };

  // Load all alumni from user's department on component mount
  useEffect(() => {
    if (loggedIn && currentUser && initialLoad) {
      handleSearch();
      setInitialLoad(false);
    }
  }, [loggedIn, currentUser, initialLoad]);

  return (
    <div className="max-w-6xl mx-auto my-6 p-6">
      {loggedIn ? (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Alumni Directory</h2>
          
          {/* Debug info for students */}
          {currentUser?.role === 'student' && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded-md">
              <p className="text-sm text-blue-700">
                Showing alumni from your department: <strong>{currentUser.department}</strong>
              </p>
            </div>
          )}
          
          {/* Search Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Search Filters</h3>
            
            {currentUser?.role === 'student' ? (
              // Simplified search for students - graduation year and branch
              <div className="max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-600 mb-2">
                      Filter by Graduation Year
                    </label>
                    <input
                      id="year"
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2020 (optional)"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-600 mb-2">
                      Filter by Branch
                    </label>
                    <input
                      id="branch"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., MCA, BCA (optional)"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition duration-200 flex items-center justify-center"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <FaSearch className="mr-2" />
                  {loading ? 'Searching...' : 'Search Alumni'}
                </button>
              </div>
            ) : (
              // Full search options for admin, college admin, professor
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="searchInput" className="block text-sm font-medium text-gray-600 mb-2">
                      Search by Name
                    </label>
                    <input
                      id="searchInput"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter alumni name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-600 mb-2">
                      Graduation Year
                    </label>
                    <input
                      id="year"
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2020"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-600 mb-2">
                      Branch
                    </label>
                    <input
                      id="branch"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., MCA, BCA"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition duration-200 flex items-center justify-center"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <FaSearch className="mr-2" />
                  {loading ? 'Searching...' : 'Search Alumni'}
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Results */}
          {searchResults.length > 0 ? (
            <div>
              <h4 className="text-xl font-semibold mb-4 text-gray-700">
                Alumni Directory ({searchResults.length} alumni found)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((alumni) => (
                  <div key={alumni._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {alumni.firstName?.[0]}{alumni.lastName?.[0]}
                      </div>
                      <div className="ml-3">
                        <h5 className="font-semibold text-gray-800">
                          {alumni.firstName} {alumni.lastName}
                        </h5>
                        <p className="text-sm text-gray-600">{alumni.degree || 'Graduate'}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaGraduationCap className="mr-2 text-blue-500" />
                        <span>{alumni.branch} - {alumni.department}</span>
                      </div>
                      
                      {alumni.startYear && alumni.endYear && (
                        <div className="flex items-center">
                          <FaCalendar className="mr-2 text-green-500" />
                          <span>{alumni.startYear} - {alumni.endYear}</span>
                        </div>
                      )}

                      {alumni.rollNumber && (
                        <div>
                          <strong>Roll No:</strong> {alumni.rollNumber}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {alumni.skills && alumni.skills.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {alumni.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                          {alumni.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{alumni.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Work Experience */}
                    {alumni.workExperiences && alumni.workExperiences.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center">
                          <FaBriefcase className="mr-2 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {alumni.workExperiences[0].workTitle} at {alumni.workExperiences[0].company}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contact Links */}
                    <div className="mt-4 flex space-x-3">
                      <a 
                        href={`mailto:${alumni.email}`}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition duration-200"
                        title="Send Email"
                      >
                        <FaEnvelope className="text-gray-600" />
                      </a>
                      
                      {alumni.socialProfiles?.linkedin && alumni.socialProfiles.linkedin !== 'https://www.linkedin.com/' && (
                        <a 
                          href={alumni.socialProfiles.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full transition duration-200"
                          title="LinkedIn Profile"
                        >
                          <FaLinkedin className="text-blue-600" />
                        </a>
                      )}
                      
                      {alumni.socialProfiles?.facebook && alumni.socialProfiles.facebook !== 'https://www.facebook.com/' && (
                        <a 
                          href={alumni.socialProfiles.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full transition duration-200"
                          title="Facebook Profile"
                        >
                          <FaFacebook className="text-blue-800" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !loading && !initialLoad ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No alumni found matching your criteria.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search filters.</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading alumni...</p>
            </div>
          ) : null}
    </div>
  ) : (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">You're Not Logged In</h1>
      <p className="text-gray-600 mb-4">
        Please log in to access our search tab.
      </p>
      <Link
        to="/login"
        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Login
      </Link>
    </div>
  )}
  </div>
  );
};

export default SearchPeople;
