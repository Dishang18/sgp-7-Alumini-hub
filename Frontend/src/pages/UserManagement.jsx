// Helper functions for role-based action visibility
// Place these outside the component to avoid parser errors
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useSelector } from 'react-redux';
// import { Navigate } from 'react-router-dom';


// export default function UserManagement() {
//   const loggedIn = useSelector((state) => state.loggedIn);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [editUser, setEditUser] = useState(null); // user being edited
//   const [showModal, setShowModal] = useState(false);

//   const fetchUsers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get('http://localhost:5000/users/all', { withCredentials: true });
//       setUsers(res.data.data.users);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     }
//     setLoading(false);
//   };

//   useEffect(() => { fetchUsers(); }, []);


//   const handleApprove = async (userId) => {
//     setLoading(true);
//     try {
//       await axios.post('http://localhost:5000/users/approve', { userId }, { withCredentials: true });
//       fetchUsers();
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     }
//     setLoading(false);
//   };

//   const handleDelete = async (userId) => {
//     if (!window.confirm('Are you sure you want to delete this user?')) return;
//     setLoading(true);
//     try {
//       await axios.delete('http://localhost:5000/users/delete', { data: { userId }, withCredentials: true });
//       fetchUsers();
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     }
//     setLoading(false);
//   };

//   const openEditModal = (user) => {
//     setEditUser({ ...user });
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditUser(null);
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditUser((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleUpdate = async () => {
//     setLoading(true);
//     try {
//       await axios.put('http://localhost:5000/users/update', { userId: editUser._id, email: editUser.email, role: editUser.role }, { withCredentials: true });
//       fetchUsers();
//       closeModal();
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     }
//     setLoading(false);
//   };

//   if (!loggedIn) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div className="max-w-5xl mx-auto mt-8">
//       <h2 className="text-2xl font-bold mb-4">User Management Dashboard</h2>
//       {loading && <div>Loading...</div>}
//       {error && <div className="text-red-600 mb-2">{error}</div>}
//       <table className="min-w-full bg-white border">
//         <thead>
//           <tr>
//             <th className="py-2 px-4 border">Email</th>
//             <th className="py-2 px-4 border">Role</th>
//             <th className="py-2 px-4 border">Approved</th>
//             <th className="py-2 px-4 border">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user._id}>
//               <td className="py-2 px-4 border">{user.email}</td>
//               <td className="py-2 px-4 border">{user.role === 'collegeadmin' ? 'College Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
//               <td className="py-2 px-4 border">{user.isApproved ? 'Yes' : 'No'}</td>
//               <td className="py-2 px-4 border flex flex-col gap-2 md:flex-row md:gap-2">
//                 {!user.isApproved && (
//                   <button onClick={() => handleApprove(user._id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Approve</button>
//                 )}
//                 <button onClick={() => openEditModal(user)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Edit</button>
//                 <button onClick={() => handleDelete(user._id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Edit Modal */}
//       {showModal && editUser && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-80">
//             <h3 className="text-lg font-bold mb-4">Edit User</h3>
//             <label className="block mb-2">Email
//               <input type="email" name="email" value={editUser.email} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" />
//             </label>
//             <label className="block mb-2">Role
//               <select name="role" value={editUser.role} onChange={handleEditChange} className="w-full border px-2 py-1 rounded">
//                 <option value="admin">Admin</option>
//                 <option value="collegeadmin">College Admin</option>
//                 <option value="professor">Professor</option>
//                 <option value="alumni">Alumni</option>
//                 <option value="student">Student</option>
//               </select>
//             </label>
//             <div className="flex justify-end gap-2 mt-4">
//               <button onClick={closeModal} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
//               <button onClick={handleUpdate} className="px-3 py-1 bg-blue-600 text-white rounded">Update</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';


// Helper functions for role-based action visibility
function canEditOrDelete(currentUser, user) {
  if (!currentUser || !user) return false;
  if (currentUser._id === user._id) return false; // Prevent self-edit/delete
  if (currentUser.role === 'admin') {
    // Admin can edit/delete all collegeadmins, professors, alumni, students
    return ['collegeadmin', 'professor', 'alumni', 'student'].includes(user.role);
  }
  if (currentUser.role === 'collegeadmin') {
    // College admin can edit/delete professors, alumni, and students of same department
    const canManageRole = ['professor', 'alumni', 'student'].includes(user.role);
    const sameDepartment = user.department && 
      currentUser.department && 
      user.department.toLowerCase() === currentUser.department.toLowerCase();

    return canManageRole && sameDepartment;
  }
  if (currentUser.role === 'professor') {
    // Professor can edit/delete alumni and students of same department and branch
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
  // Approval follows same rules as edit/delete
  return canEditOrDelete(currentUser, user);
}

export default function UserManagement() {
  const loggedIn = useSelector((state) => state.loggedIn);
  const currentUser = useSelector((state) => state.currentUser);
  const [users, setUsers] = useState([]);
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null); // user being edited
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'pending'
  
  // Admin filtering and pagination state
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // College admin registration form state
  const [collegeAdminForm, setCollegeAdminForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    collegeName: '',
    department: ''
  });
  // Handle college admin form input
  const handleCollegeAdminInput = (e) => {
    const { name, value } = e.target;
    setCollegeAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit college admin registration
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
      const res = await axios.get('http://localhost:5000/users/all', { withCredentials: true });
      const allUsers = res.data.data.users;
      
      // Extract unique departments from all users
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
      const res = await axios.get('http://localhost:5000/users/all', { withCredentials: true });

      
      // Filter to show relevant users based on role
      let filteredUsers = res.data.data.users;
      
      if (currentUser?.role === 'admin') {
        // Admin can see all users, but we'll apply filters
        filteredUsers = res.data.data.users.filter(user => {
          // Show collegeadmin, professor, alumni, student
          return ['collegeadmin', 'professor', 'alumni', 'student'].includes(user.role);
        });
      } else if (currentUser?.role === 'collegeadmin') {
        // College admin can see students, alumni, and professors from their department
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

      // Filter unapproved users based on current user role
      let filteredUnapprovedUsers = res.data.data.users;
      if (currentUser?.role === 'collegeadmin') {
        // College admin can only see unapproved users from their department
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
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  // Filter and pagination logic
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

  // Pagination logic
  const currentUsers = activeTab === 'approved' ? filteredUsers : filteredUnapprovedUsers;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsersPage = currentUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(currentUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
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
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">User Management Dashboard</h2>
      
      {/* College Admin Registration Form (admin only) */}
      {currentUser?.role === 'admin' && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Register College Admin</h3>
          <form onSubmit={handleCollegeAdminRegister} className="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="firstName" value={collegeAdminForm.firstName} onChange={handleCollegeAdminInput} placeholder="First Name" className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              <input name="lastName" value={collegeAdminForm.lastName} onChange={handleCollegeAdminInput} placeholder="Last Name" className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input name="collegeName" value={collegeAdminForm.collegeName} onChange={handleCollegeAdminInput} placeholder="College Name" className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              <input name="department" value={collegeAdminForm.department} onChange={handleCollegeAdminInput} placeholder="Department" className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              <input name="email" value={collegeAdminForm.email} onChange={handleCollegeAdminInput} placeholder="Email" type="email" className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              <input name="password" value={collegeAdminForm.password} onChange={handleCollegeAdminInput} placeholder="Password" type="password" className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <button type="submit" className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200">Register College Admin</button>
          </form>
        </div>
      )}

      {/* Admin Filtering Controls */}
      {currentUser?.role === 'admin' && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Filter Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mt-4 text-sm text-gray-600">
            Showing {currentUsers.length} users
            {selectedDepartment && ` in ${selectedDepartment} department`}
            {selectedRole && ` with role ${selectedRole}`}
          </div>
        </div>
      )}

      {loading && <div className="flex justify-center"><div className="text-indigo-600">Loading...</div></div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('approved');
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Approvals ({filteredUnapprovedUsers.length})
            </button>
          </nav>
        </div>
      </div>
      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                {activeTab === 'approved' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsersPage.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
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
                    <div className="flex space-x-2">
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
            <div className="text-gray-500">
              {activeTab === 'approved' ? 'No approved users found.' : 'No pending approvals.'}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
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
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {/* Department/Branch fields for relevant roles */}
            {(editUser.role === 'student' || editUser.role === 'alumni' || editUser.role === 'collegeadmin' || editUser.role === 'professor') && (
              <label className="block mb-2">Department
                <input type="text" name="department" value={editUser.department || ''} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" />
              </label>
            )}
            {(editUser.role === 'student' || editUser.role === 'alumni') && (
              <label className="block mb-2">Branch
                <input type="text" name="branch" value={editUser.branch || ''} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" />
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
  );
}
