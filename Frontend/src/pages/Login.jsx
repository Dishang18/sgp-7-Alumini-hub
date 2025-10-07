import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { login } from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Loader from "../Components/Loader";
import API_CONFIG from "../config/api";
import { 
  AcademicCapIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
    role: selectedRole,
  });
  const dispatch = useDispatch();
  // Options for the role dropdown
  const roleOptions = [
    { value: "alumni", label: "Alumni" },
    { value: "professor", label: "Professor" },
    { value: "admin", label: "Admin" },
    { value: "collegeadmin", label: "College Admin" },
    { value: "student", label: "Student" },
  ];
  const navigate = useNavigate();

  // Handle role selection
  const handleRoleChange = (selectedOption) => {
    setSelectedRole(selectedOption);
    console.log(selectedOption);
  };
  const userRole = selectedRole?.value;
  // console.log(userRole)

  var role = userRole;
  console.log(role);
  var userData = {
    email: user.email,
    password: user.password,
    role: role,
  };
  // Handle form submission
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(user.email)) {
      toast.error('Please enter a valid email.');
      return;
    }
    if (!user.password || user.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    setLoading(true);
    const url = API_CONFIG.getUrl("/auth/login");

    try {
      const response = await axios.post(url, userData, { withCredentials: true });
      // Backend returns { user }
      const { user: userObj } = response.data;
      dispatch(login(userObj));
      toast.success("Login Successful");
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      if (err.response) {
        toast.error(err.response.data.message || err.message);
      } else {
        toast.error(err.message + "! Database server is down.");
      }
    }
  };

  // Custom styles for react-select to match our design
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      padding: '0.5rem',
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

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo and Header */}
          <div className="flex justify-center">
            <div className="flex items-center">
              <AcademicCapIcon className="h-12 w-12 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Alumni Connect</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your professional alumni account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={user.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={user.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Select your role
                </label>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Select
                    id="role"
                    name="role"
                    options={roleOptions}
                    onChange={handleRoleChange}
                    value={selectedRole}
                    placeholder="Choose your role"
                    styles={customSelectStyles}
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                  } group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader text="Signing in..." />
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">New to Alumni Connect?</span>
                  </div>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <Link 
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Create your account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
