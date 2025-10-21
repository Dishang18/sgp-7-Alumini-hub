import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  const [availableBranches, setAvailableBranches] = useState([]);
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
      await axios.post('http://localhost:5000/auth/register', {
        ...collegeAdminForm,
        role: 'collegeadmin',
      }, { withCredentials: true });
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
      const res = await axios.get('http://localhost:5000/users/departments', { withCredentials: true });
      const departments = res.data.data.departments || [];
      setAvailableDepartments(departments.sort());
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchBranches = async (department) => {
    try {
      const url = department ? `http://localhost:5000/users/branches/all?department=${encodeURIComponent(department)}` : 'http://localhost:5000/users/branches/all';
      const res = await axios.get(url, { withCredentials: true });
      const branches = res.data.data.branches || [];
      setAvailableBranches(branches.sort());
    } catch (err) {
      console.error('Error fetching branches:', err);
      setAvailableBranches([]);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/users/all', { withCredentials: true });
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
      const res = await axios.get('http://localhost:5000/users/unapproved', { withCredentials: true });
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
      await axios.post('http://localhost:5000/users/approve', { userId }, { withCredentials: true });
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
      await axios.delete('http://localhost:5000/users/delete', { data: { userId }, withCredentials: true });
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
    if (user.department) fetchBranches(user.department);
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
      await axios.put('http://localhost:5000/users/update', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl mx-auto mt-8 px-2 sm:px-4">
        <h2 className="text-3xl font-bold mb-6 text-blue-700">User Management Dashboard</h2>
        
        {/* College Admin Registration Form (admin only) */}
        {currentUser?.role === 'admin' && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Register College Admin</h3>
            <form onSubmit={handleCollegeAdminRegister} className="max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="firstName" value={collegeAdminForm.firstName} onChange={handleCollegeAdminInput} placeholder="First Name" className="border border-blue-200 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input name="lastName" value={collegeAdminForm.lastName} onChange={handleCollegeAdminInput} placeholder="Last Name" className="border border-blue-200 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="collegeName" value={collegeAdminForm.collegeName} onChange={handleCollegeAdminInput} placeholder="College Name" className="border border-blue-200 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="department" value={collegeAdminForm.department} onChange={handleCollegeAdminInput} placeholder="Department" className="border border-blue-200 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input name="email" value={collegeAdminForm.email} onChange={handleCollegeAdminInput} placeholder="Email" type="email" className="border border-blue-200 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input name="password" value={collegeAdminForm.password} onChange={handleCollegeAdminInput} placeholder="Password" type="password" className="border border-blue-200 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200">Register College Admin</button>
            </form>
          </div>
        )}

        {/* Admin Filtering Controls */}
        {currentUser?.role === 'admin' && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Filter Users</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                  placeholder="Search by name or email..."
                  className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-600">
              Showing {currentUsers.length} users
              {selectedDepartment && ` in ${selectedDepartment} department`}
              {selectedRole && ` with role ${selectedRole}`}
            </div>
          </div>
        )}

        {loading && <div className="flex justify-center"><div className="text-blue-600">Loading...</div></div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-blue-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('approved');
                  setCurrentPage(1);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approved'
                    ? 'border-blue-500 text-blue-700'
                    : 'border-transparent text-blue-500 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                Approved Users ({filteredUsers.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('pending');
                  setCurrentPage(1);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-blue-500 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                Pending Approvals ({filteredUnapprovedUsers.length})
              </button>
            </nav>
          </div>
        </div>
        {/* Table Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max divide-y divide-blue-200 bg-gradient-to-br from-blue-50 via-blue-100 to-white">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Branch</th>
                  {activeTab === 'approved' && <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {currentUsersPage.map(user => (
                  <tr key={user._id} className="hover:bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'alumni' ? 'bg-green-100 text-green-800' :
                        user.role === 'professor' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'collegeadmin' ? 'College Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.branch || '-'}</td>
                    {activeTab === 'approved' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                        {activeTab === 'pending' && canApprove(currentUser, user) && (
                          <button 
                            onClick={() => handleApprove(user._id)} 
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition duration-200"
                          >
                            Approve
                          </button>
                        )}
                        {canEditOrDelete(currentUser, user) && (
                          <>
                            <button 
                              onClick={() => openEditModal(user)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition duration-200"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(user._id)} 
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition duration-200"
                            >
                              Delete
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
          
          {/* Empty State */}
          {currentUsers.length === 0 && (
            <div className="text-center py-8">
              <div className="text-blue-500">
                {activeTab === 'approved' ? 'No approved users found.' : 'No pending approvals.'}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-blue-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-blue-700">
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastUser, currentUsers.length)}</span> of{' '}
                    <span className="font-medium">{currentUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-blue-300 bg-white text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === currentPage
                            ? 'z-10 bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-blue-300 bg-white text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showModal && editUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
              <h3 className="text-lg font-bold mb-4">Edit User</h3>
              <label className="block mb-2">Email
                <input type="email" name="email" value={editUser.email} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" />
              </label>
              <label className="block mb-2">Role
                <select name="role" value={editUser.role} onChange={handleEditChange} className="w-full border px-2 py-1 rounded">
                  <option value="admin">Admin</option>
                  <option value="collegeadmin">College Admin</option>
                  <option value="professor">Professor</option>
                  <option value="alumni">Alumni</option>
                  <option value="student">Student</option>
                </select>
              </label>
              {(editUser.role === 'student' || editUser.role === 'alumni' || editUser.role === 'collegeadmin' || editUser.role === 'professor') && (
                <label className="block mb-2">Department
                  <select name="department" value={editUser.department || ''} onChange={(e) => {
                    handleEditChange(e);
                    // load branches for selected department
                    fetchBranches(e.target.value);
                  }} className="w-full border px-2 py-1 rounded">
                    <option value="">Select Department</option>
                    {availableDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
              )}
              {(editUser.role === 'student' || editUser.role === 'alumni') && (
                <label className="block mb-2">Branch
                  <select name="branch" value={editUser.branch || ''} onChange={handleEditChange} className="w-full border px-2 py-1 rounded">
                    <option value="">Select Branch</option>
                    {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={closeModal} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                <button onClick={handleUpdate} className="px-3 py-1 bg-blue-600 text-white rounded">Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}