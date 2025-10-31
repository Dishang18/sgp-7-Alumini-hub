import React, { useState, useEffect } from 'react';
import { FaShare } from 'react-icons/fa';
import Select from 'react-select';
import { getLoggedIn } from '../services/authService';
import { Link } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

// Theme config (same as sidebar/login)
const theme = {
  gradientBg: "bg-gradient-to-br from-blue-50 to-blue-100",
  cardBg: "bg-white",
  cardShadow: "shadow-xl",
  cardRadius: "rounded-xl",
  inputFocus: "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  btn: "bg-blue-600 text-white hover:bg-blue-700",
  btnDisabled: "opacity-70 cursor-not-allowed",
  link: "text-blue-600 hover:text-blue-700",
  divider: "border-gray-300",
};

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: '1px solid #D1D5DB',
    borderRadius: '0.5rem',
    minHeight: '44px',
    boxShadow: state.isFocused ? '0 0 0 2px #3B82F6' : 'none',
    borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
    '&:hover': {
      borderColor: '#9CA3AF'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : 'white',
    color: state.isSelected ? 'white' : '#374151',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6B7280',
  })
};

const SendMail = () => {
  const loggedIn = getLoggedIn();
  const [countryList, setCountryList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cityListState, setCityListState] = useState([]);
  const [yesNo, setYesNo] = useState(false);
  const [selectedCity, setSelectedCity] = useState([]);

  useEffect(() => {
    // Fetch data if needed
  }, []);

  return (
    <div className={`min-h-screen ${theme.gradientBg} flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <AcademicCapIcon className="h-12 w-12 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">CharuVerse</span>
        </div>
        <div className={`${theme.cardBg} ${theme.cardShadow} ${theme.cardRadius} p-8`}>
          {loggedIn ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Send Mail to Alumni
              </h2>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  College Admin Name
                </label>
                <Select
                  required
                  isMulti
                  isSearchable
                  placeholder="Select College Admins .."
                  name="collegeadmin"
                  styles={customSelectStyles}
                  className="text-sm"
                  classNamePrefix="select"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Batch
                </label>
                <Select
                  required
                  isMulti
                  isSearchable
                  placeholder="Select which Batch .."
                  name="year"
                  styles={customSelectStyles}
                  className="text-sm"
                  classNamePrefix="select"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Branch
                </label>
                <Select
                  required
                  isMulti
                  isSearchable
                  placeholder="Select which Branch .."
                  name="branch"
                  styles={customSelectStyles}
                  className="text-sm"
                  classNamePrefix="select"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  className={`block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none ${theme.inputFocus} sm:text-sm transition-colors duration-200`}
                  type="text"
                  required
                  placeholder="Subject"
                  name="subject"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  className={`block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none ${theme.inputFocus} sm:text-sm transition-colors duration-200`}
                  type="text"
                  placeholder="Message"
                  required
                  name="message"
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-center pt-2">
                <button
                  type="submit"
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg ${theme.btn} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
                >
                  Send Mail
                  <FaShare className="inline-block ml-2 mt-1" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold mb-4">You're Not Logged In</h1>
              <p className="text-gray-600 mb-4">
                Please log in to access our send mail tab.
              </p>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.btn}`}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendMail;