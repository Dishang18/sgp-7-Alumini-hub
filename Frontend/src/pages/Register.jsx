import "react-toastify/dist/ReactToastify.css";
import {
  AcademicCapIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { useState, useCallback, memo } from "react";
import apiClient from "../config/apiClient";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../Components/Loader";

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

const InputField = memo(({ icon: Icon, label, name, type = "text", placeholder, required = false, autoComplete = "off", value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none ${theme.inputFocus} sm:text-sm transition-colors duration-200`}
        placeholder={placeholder}
      />
    </div>
  </div>
));

function Register() {
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "",
    institute: "",
    branch: "",
    enrollmentNumber: "",
    year: "",
    startYear: "",
    endYear: "",
    degree: "",
    rollNumber: "",
  });

  const instituteOptions = [
    { value: 'CSPIT', label: 'CSPIT' },
    { value: 'CMPICA', label: 'CMPICA' },
    { value: 'RPCP', label: 'RPCP' },
    { value: 'IIIM', label: 'IIIM' },
    { value: 'PDPIAS', label: 'PDPIAS' },
    { value: 'ARIP', label: 'ARIP' },
    { value: 'MTIN', label: 'MTIN' },
    { value: 'BDIPS', label: 'BDIPS' },
    { value: 'DEPSTAR', label: 'DEPSTAR' },
  ];
  const branchOptionsMap = {
    CSPIT: [
      { value: 'CE', label: 'CE' },
      { value: 'IT', label: 'IT' },
      { value: 'CS', label: 'CS' },
      { value: 'AIML', label: 'AIML' },
      { value: 'EC', label: 'EC' },
      { value: 'CL', label: 'CL' },
      { value: 'ME', label: 'ME' },
      { value: 'EE', label: 'EE' },
    ],
    CMPICA: [
      { value: 'B.sc.(IT)', label: 'B.sc.(IT)' },
      { value: 'BCA', label: 'BCA' },
      { value: 'M.sc.(IT)', label: 'M.sc.(IT)' },
      { value: 'MCA', label: 'MCA' },
    ],
    RPCP: [
      { value: 'B.Pharm', label: 'B.Pharm' },
      { value: 'M.Pharm', label: 'M.Pharm' },
    ],
    IIIM: [
      { value: 'BBA', label: 'BBA' },
      { value: 'MBA', label: 'MBA' },
    ],
    PDPIAS: [
      { value: 'B.sc.', label: 'B.sc.' },
      { value: 'M.sc', label: 'M.sc' },
      { value: 'M Phil', label: 'M Phil' },
    ],
    ARIP: [
      { value: 'BPT', label: 'BPT' },
      { value: 'MPT', label: 'MPT' },
    ],
    MTIN: [
      { value: 'B.sc. Nursing', label: 'B.sc. Nursing' },
      { value: 'GNM', label: 'GNM' },
    ],
    BDIPS: [
      { value: 'BMIT', label: 'BMIT' },
      { value: 'BOP', label: 'BOP' },
    ],
    DEPSTAR: [
      { value: 'DCE', label: 'DCE' },
      { value: 'DIT', label: 'DIT' },
      { value: 'DCS', label: 'DCS' },
    ],
  };
  const [availableBranches, setAvailableBranches] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  const navigate = useNavigate();

  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "alumni", label: "Alumni" },
    { value: "professor", label: "Professor" },
  ];

  const degreeOptions = [
    { value: "bachelor", label: "Bachelor" },
    { value: "master", label: "Master" },
    { value: "phd", label: "PhD" },
  ];

  // Department / Branch / Year options (small defaults; can be extended)
  const departmentOptions = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Mechanical', label: 'Mechanical' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Other', label: 'Other' }
  ];

  const branchOptions = [
    { value: 'Software', label: 'Software' },
    { value: 'AI/ML', label: 'AI/ML' },
    { value: 'Networks', label: 'Networks' },
    { value: 'Embedded', label: 'Embedded' },
    { value: 'General', label: 'General' },
    { value: 'Other', label: 'Other' }
  ];

  const yearOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' }
  ];

  const handleDegreeChange = useCallback((selectedOption) => {
    setSelectedDegree(selectedOption);
    setFormData(prevData => ({
      ...prevData,
      degree: selectedOption?.value || ''
    }));
  }, []);

  const handleRoleChange = useCallback((selectedOption) => {
    setSelectedRole(selectedOption);
    setFormData(prevData => ({
      ...prevData,
      role: selectedOption?.value || ''
    }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);


  const handleInstituteSelect = useCallback((selectedOption) => {
    setSelectedInstitute(selectedOption);
    setFormData(prev => ({ ...prev, institute: selectedOption?.value || '', branch: '' }));
    setAvailableBranches(selectedOption && branchOptionsMap[selectedOption.value] ? branchOptionsMap[selectedOption.value] : []);
  }, []);

  const handleBranchSelect = useCallback((selectedOption) => {
    setFormData(prev => ({ ...prev, branch: selectedOption?.value || '' }));
  }, []);

  const handleYearSelect = useCallback((selectedOption) => {
    setFormData(prev => ({ ...prev, year: selectedOption?.value || '' }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Frontend validation
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      toast.error('Please enter a valid email.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (!formData.role) {
      toast.error('Please select a role.');
      return;
    }
    // Role-specific validation
    if (formData.role === "student") {
      if (!formData.enrollmentNumber || !formData.institute || !formData.branch || !formData.year) {
        toast.error('enrollmentNumber, institute, branch, and year are required for students.');
        return;
      }
    } else if (formData.role === "alumni") {
      if (!formData.startYear || !formData.endYear || !formData.degree || !formData.institute || !formData.branch || !formData.rollNumber) {
        toast.error('startYear, endYear, degree, institute, branch, and rollNumber are required for alumni.');
        return;
      }
    } else if (formData.role === "professor") {
      if (!formData.institute || !formData.branch ) {
        toast.error('institute and branch are required for professors.');
        return;
      }
    } else if (formData.role === "collegeadmin") {
      if (!formData.institute) {
        toast.error('institute is required for college admins.');
        return;
      }
    }
    setLoading(true);
    try {
      // Map institute to department for backend compatibility
      const payload = {
        ...formData,
        department: formData.institute || ""
      };
      const response = await apiClient.post(
        "/register/user",
        payload
      );
      const { status } = response.data;
      if (status === "success") {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  // Custom styles for react-select (icon inside box)
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      paddingLeft: '2.5rem', // Space for icon
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      minHeight: '48px',
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
      <div className={`min-h-screen ${theme.gradientBg} py-12 sm:px-6 lg:px-8`}>
        <div className="max-w-6xl mx-auto bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Illustration */}
            <div className="hidden md:flex items-center justify-center h-[720px] bg-white rounded-lg overflow-hidden shadow-inner">
              <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: `url('/leftside.png')`, backgroundPosition: 'center' }} aria-hidden="true" />
            </div>

            {/* Right: Registration card */}
            <div className="w-full flex items-center justify-center">
              <div className={`${theme.cardBg} ${theme.cardShadow} ${theme.cardRadius} p-8 w-full max-w-2xl`}>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4 items-center">
                    <img src="/main.png" alt="Charusat" className="h-24 mb-7 w-auto object-contain" loading="lazy" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">Join Our Professional Network</h2>
                  <p className="mt-2 text-sm text-gray-600">Create your account to connect with fellow alumni and advance your career</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={EnvelopeIcon}
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required={true}
                  autoComplete="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
                
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
                      autoComplete="new-password"
                      required
                      value={formData.password ?? ''}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none ${theme.inputFocus} sm:text-sm transition-colors duration-200`}
                      placeholder="Create a secure password"
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
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Select your role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-20">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  </span>
                  <Select
                    id="role"
                    name="role"
                    options={roleOptions}
                    value={selectedRole}
                    onChange={handleRoleChange}
                    placeholder="Choose your role"
                    styles={customSelectStyles}
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {selectedRole && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedRole.label} Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Common fields for most roles */}
                    {selectedRole.value !== 'admin' && (
                      <>
                        <InputField
                          icon={UserIcon}
                          label="First Name"
                          name="firstName"
                          placeholder="Enter your first name"
                          required={true}
                          value={formData.firstName || ''}
                          onChange={handleChange}
                        />
                        <InputField
                          icon={UserIcon}
                          label="Last Name"
                          name="lastName"
                          placeholder="Enter your last name"
                          value={formData.lastName || ''}
                          onChange={handleChange}
                        />
                      </>
                    )}

                    {/* Student-specific fields */}
                    {selectedRole?.value === 'student' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Institute</label>
                          <Select
                            id="institute"
                            name="institute"
                            options={instituteOptions}
                            value={selectedInstitute}
                            onChange={handleInstituteSelect}
                            placeholder="Select institute"
                            styles={customSelectStyles}
                          />
                        </div>
                        <InputField
                          icon={IdentificationIcon}
                          label="Enrollment Number"
                          name="enrollmentNumber"
                          placeholder="Enter your enrollment number"
                          required={true}
                          value={formData.enrollmentNumber || ''}
                          onChange={handleChange}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                          <Select
                            id="branch"
                            name="branch"
                            options={availableBranches}
                            value={availableBranches.find(o => o.value === formData.branch) || null}
                            onChange={handleBranchSelect}
                            placeholder="Select branch"
                            styles={customSelectStyles}
                            isDisabled={!selectedInstitute}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                          <Select
                            id="year"
                            name="year"
                            options={yearOptions}
                            value={yearOptions.find(o => o.value === formData.year) || null}
                            onChange={handleYearSelect}
                            placeholder="Select current year"
                            styles={customSelectStyles}
                          />
                        </div>
                      </>
                    )}

                    {/* Alumni-specific fields */}
                    {selectedRole?.value === 'alumni' && (
                      <>
                        <InputField
                          icon={CalendarDaysIcon}
                          label="Start Year"
                          name="startYear"
                          placeholder="e.g., 2018"
                          required={true}
                          value={formData.startYear || ''}
                          onChange={handleChange}
                        />
                        <InputField
                          icon={CalendarDaysIcon}
                          label="End Year"
                          name="endYear"
                          placeholder="e.g., 2022"
                          required={true}
                          value={formData.endYear || ''}
                          onChange={handleChange}
                        />
                        <div className="md:col-span-2">
                          <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
                            Degree
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-20">
                              <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                            </span>
                            <Select
                              id="degree"
                              name="degree"
                              options={degreeOptions}
                              value={selectedDegree}
                              onChange={handleDegreeChange}
                              placeholder="Select your degree"
                              styles={customSelectStyles}
                              className="text-sm"
                              classNamePrefix="select"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Institute</label>
                          <Select
                            id="institute"
                            name="institute"
                            options={instituteOptions}
                            value={selectedInstitute}
                            onChange={handleInstituteSelect}
                            placeholder="Select institute"
                            styles={customSelectStyles}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                          <Select
                            id="branch"
                            name="branch"
                            options={availableBranches}
                            value={availableBranches.find(o => o.value === formData.branch) || null}
                            onChange={handleBranchSelect}
                            placeholder="Select branch"
                            styles={customSelectStyles}
                            isDisabled={!selectedInstitute}
                          />
                        </div>
                        <InputField
                          icon={IdentificationIcon}
                          label="Roll Number"
                          name="rollNumber"
                          placeholder="Enter your roll number"
                          required={true}
                          value={formData.rollNumber || ''}
                          onChange={handleChange}
                        />
                      </>
                    )}

                    {/* Professor-specific fields */}
                    {selectedRole?.value === 'professor' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Institute</label>
                          <Select
                            id="institute"
                            name="institute"
                            options={instituteOptions}
                            value={selectedInstitute}
                            onChange={handleInstituteSelect}
                            placeholder="Select institute"
                            styles={customSelectStyles}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                          <Select
                            id="branch"
                            name="branch"
                            options={availableBranches}
                            value={availableBranches.find(o => o.value === formData.branch) || null}
                            onChange={handleBranchSelect}
                            placeholder="Select branch"
                            styles={customSelectStyles}
                            isDisabled={!selectedInstitute}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium ${theme.btn} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${loading ? theme.btnDisabled : ""}`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader text="Creating your account..." />
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {/* Sign in link */}
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${theme.divider}`} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    to="/login"
                    className={`font-medium ${theme.link} transition-colors duration-200`}
                  >
                    Sign in to your account
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}

export default Register;