import React, { useEffect, useState } from 'react';
import apiClient from '../config/apiClient';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Helper functions for role-based action visibility
function canEditOrDelete(currentUser, user) {
  if (!currentUser || !user) return false;
  if (currentUser._id === user._id) return false; // Prevent self-edit/delete
  if (currentUser.role === 'admin') {
    return ['collegeadmin', 'professor', 'alumni', 'student'].includes(user.role);
  }
  if (currentUser.role === 'collegeadmin') {
    const canManageRole = ['professor', 'alumni', 'student'].includes(user.role);
    const sameDepartment = user.department &&
      currentUser.department &&
      user.department.toLowerCase() === currentUser.department.toLowerCase();
    return canManageRole && sameDepartment;
  }
  if (currentUser.role === 'professor') {
    return (
      ['alumni', 'student'].includes(user.role) &&
      user.department &&
      user.branch &&
      user.department === currentUser.department &&
      user.branch === currentUser.branch
    );
  }
  return false;
}

function canApprove(currentUser, user) {
  return canEditOrDelete(currentUser, user);
}

export default function UserManagement() {
  const loggedIn = useSelector((state) => state.loggedIn);
  const currentUser = useSelector((state) => state.currentUser);
  const [users, setUsers] = useState([]);
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('approved');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeAdminForm, setCollegeAdminForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    collegeName: '',
    department: ''
  });

  const handleCollegeAdminInput = (e) => {
    const { name, value } = e.target;
    setCollegeAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCollegeAdminRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/register', {
        ...collegeAdminForm,
        role: 'collegeadmin',
      });
      setCollegeAdminForm({ email: '', password: '', firstName: '', lastName: '', collegeName: '', department: '' });
      fetchUsers();
      alert('College Admin registered successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get('/users/all');
      const allUsers = res.data.data.users;
      const departments = [...new Set(allUsers
        .filter(user => user.department && user.department.trim())
        .map(user => user.department.trim()))];
      setAvailableDepartments(departments.sort());
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/users/all');
      let filteredUsers = res.data.data.users;
      if (currentUser?.role === 'admin') {
        filteredUsers = res.data.data.users.filter(user => {
          return ['collegeadmin', 'professor', 'alumni', 'student'].includes(user.role);
        });
      } else if (currentUser?.role === 'collegeadmin') {
        filteredUsers = res.data.data.users.filter(user => {
          const isRelevantRole = ['student', 'alumni', 'professor'].includes(user.role);
          const sameDepartment = user.department &&
            currentUser.department &&
            user.department.toLowerCase() === currentUser.department.toLowerCase();
          return isRelevantRole && sameDepartment;
        });
      }
      setUsers(filteredUsers);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const fetchUnapprovedUsers = async () => {
    try {
      const res = await apiClient.get('/users/unapproved');
      let filteredUnapprovedUsers = res.data.data.users;
      if (currentUser?.role === 'collegeadmin') {
        filteredUnapprovedUsers = res.data.data.users.filter(user => {
          const isRelevantRole = ['student', 'alumni', 'professor'].includes(user.role);
          const sameDepartment = user.department &&
            currentUser.department &&
            user.department.toLowerCase() === currentUser.department.toLowerCase();
          return isRelevantRole && sameDepartment;
        });
      }
      setUnapprovedUsers(filteredUnapprovedUsers);
    } catch (err) {
      console.error('Error fetching unapproved users:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchUnapprovedUsers();
      if (currentUser.role === 'admin') {
        fetchDepartments();
      }
    }
  }, [currentUser]);

  const handleApprove = async (userId) => {
    setLoading(true);
    try {
      await apiClient.post('/users/approve', { userId });
      fetchUsers();
      fetchUnapprovedUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    try {
      await apiClient.delete('/users/delete', { data: { userId } });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const openEditModal = (user) => {
    setEditUser({
      ...user,
      department: user.department || '',
      branch: user.branch || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesSearch = !searchQuery ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesRole && matchesSearch;
  });

  const filteredUnapprovedUsers = unapprovedUsers.filter(user => {
    const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesSearch = !searchQuery ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesRole && matchesSearch;
  });

  const currentUsers = activeTab === 'approved' ? filteredUsers : filteredUnapprovedUsers;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsersPage = currentUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(currentUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await apiClient.put('/users/update', {
        userId: editUser._id,
        email: editUser.email,
        role: editUser.role,
        department: editUser.department,
        branch: editUser.branch
      }, { withCredentials: true });
      await fetchUsers();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 mb-2">
            User Management Dashboard
          </h2>
          <p className="text-blue-600 text-sm sm:text-base">
            Manage users, approvals, and permissions efficiently
          </p>
        </div>
        
        {/* College Admin Registration Form (admin only) */}
        {currentUser?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-blue-700">Register New College Admin</h3>
            </div>
            <form onSubmit={handleCollegeAdminRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name *</label>
                  <input 
                    name="firstName" 
                    value={collegeAdminForm.firstName} 
                    onChange={handleCollegeAdminInput} 
                    placeholder="Enter first name" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input 
                    name="lastName" 
                    value={collegeAdminForm.lastName} 
                    onChange={handleCollegeAdminInput} 
                    placeholder="Enter last name" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">College Name *</label>
                  <input 
                    name="collegeName" 
                    value={collegeAdminForm.collegeName} 
                    onChange={handleCollegeAdminInput} 
                    placeholder="Enter college name" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department *</label>
                  <input 
                    name="department" 
                    value={collegeAdminForm.department} 
                    onChange={handleCollegeAdminInput} 
                    placeholder="Enter department" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input 
                    name="email" 
                    value={collegeAdminForm.email} 
                    onChange={handleCollegeAdminInput} 
                    placeholder="Enter email address" 
                    type="email" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password *</label>
                  <input 
                    name="password" 
                    value={collegeAdminForm.password} 
                    onChange={handleCollegeAdminInput} 
                    placeholder="Enter password" 
                    type="password" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Register College Admin
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtering Controls */}
        {currentUser?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-green-700">Filter & Search Users</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search Users</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleFilterChange();
                    }}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Departments</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Roles</option>
                  <option value="collegeadmin">College Admin</option>
                  <option value="professor">Professor</option>
                  <option value="alumni">Alumni</option>
                  <option value="student">Student</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedRole('');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">
                📊 Showing {currentUsers.length} users
                {selectedDepartment && ` in ${selectedDepartment} department`}
                {selectedRole && ` with role ${selectedRole}`}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-600 font-medium">Loading users...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => {
                  setActiveTab('approved');
                  setCurrentPage(1);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'approved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved Users ({filteredUsers.length})
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('pending');
                  setCurrentPage(1);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'pending'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending Approvals ({filteredUnapprovedUsers.length})
                </span>
              </button>
            </nav>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    {activeTab === 'approved' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsersPage.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {(user.firstName || user.email)?.[0]?.toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'alumni' ? 'bg-green-100 text-green-800' :
                          user.role === 'professor' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'collegeadmin' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'collegeadmin' ? 'College Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.branch || '-'}</td>
                      {activeTab === 'approved' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ Approved
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {activeTab === 'pending' && canApprove(currentUser, user) && (
                            <button 
                              onClick={() => handleApprove(user._id)} 
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition duration-200 transform hover:scale-105"
                            >
                              ✓ Approve
                            </button>
                          )}
                          {canEditOrDelete(currentUser, user) && (
                            <>
                              <button 
                                onClick={() => openEditModal(user)} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition duration-200 transform hover:scale-105"
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(user._id)} 
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition duration-200 transform hover:scale-105"
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {currentUsersPage.map(user => (
              <div key={user._id} className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                        {(user.firstName || user.email)?.[0]?.toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  {activeTab === 'approved' && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✓ Approved
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</span>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'alumni' ? 'bg-green-100 text-green-800' :
                        user.role === 'professor' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'collegeadmin' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'collegeadmin' ? 'College Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</span>
                    <p className="mt-1 text-sm text-gray-900">{user.department || '-'}</p>
                  </div>
                  {user.branch && (
                    <div className="col-span-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</span>
                      <p className="mt-1 text-sm text-gray-900">{user.branch}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeTab === 'pending' && canApprove(currentUser, user) && (
                    <button 
                      onClick={() => handleApprove(user._id)} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 transform hover:scale-105 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  )}
                  {canEditOrDelete(currentUser, user) && (
                    <>
                      <button 
                        onClick={() => openEditModal(user)} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 transform hover:scale-105 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)} 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 transform hover:scale-105 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {currentUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'approved' ? 'No approved users found' : 'No pending approvals'}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'approved' 
                  ? 'There are no approved users matching your current filters.' 
                  : 'All users have been processed. No pending approvals at this time.'}
              </p>
              {(selectedDepartment || selectedRole || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedRole('');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Pagination Controls - Enhanced */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6">
              {/* Mobile Pagination */}
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Desktop Pagination */}
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium text-blue-600">{indexOfFirstUser + 1}</span> to{' '}
                    <span className="font-medium text-blue-600">{Math.min(indexOfLastUser, currentUsers.length)}</span> of{' '}
                    <span className="font-medium text-blue-600">{currentUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                            pageNumber === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Edit Modal */}
        {showModal && editUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto max-h-screen overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Edit User Details</h3>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={editUser.email} 
                    onChange={handleEditChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select 
                    name="role" 
                    value={editUser.role} 
                    onChange={handleEditChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="admin">Admin</option>
                    <option value="collegeadmin">College Admin</option>
                    <option value="professor">Professor</option>
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {(editUser.role === 'student' || editUser.role === 'alumni' || editUser.role === 'collegeadmin' || editUser.role === 'professor') && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input 
                      type="text" 
                      name="department" 
                      value={editUser.department || ''} 
                      onChange={handleEditChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Enter department"
                    />
                  </div>
                )}

                {(editUser.role === 'student' || editUser.role === 'alumni') && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <input 
                      type="text" 
                      name="branch" 
                      value={editUser.branch || ''} 
                      onChange={handleEditChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Enter branch"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
                <button 
                  onClick={closeModal} 
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate} 
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}