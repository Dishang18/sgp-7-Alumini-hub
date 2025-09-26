import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

// Role-based access for student management
function canApproveStudent(currentUser, student) {
  if (!currentUser || !student) return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'collegeadmin') {
    return student.department && student.department === currentUser.department;
  }
  if (currentUser.role === 'professor') {
    return (
      student.department &&
      student.branch &&
      student.department === currentUser.department &&
      student.branch === currentUser.branch
    );
  }
  return false;
}

function canDeleteStudent(currentUser, student) {
  // Same logic as approve
  return canApproveStudent(currentUser, student);
}

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const currentUser = useSelector((state) => state.currentUser);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByApproval, setFilterByApproval] = useState('all'); // 'all', 'approved', 'pending'

  const openEditModal = (student) => {
    setEditStudent({ ...student });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditStudent(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/users/students/update', {
        studentId: editStudent._id,
        enrollmentNumber: editStudent.enrollmentNumber,
        department: editStudent.department,
        branch: editStudent.branch,
        year: editStudent.year,
        email: editStudent.email,
        firstName: editStudent.firstName,
        lastName: editStudent.lastName,
      }, { withCredentials: true });
      fetchStudents();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/users/students/all', { withCredentials: true });
      setStudents(res.data.data.students);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  // Filter and search logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApproval = filterByApproval === 'all' || 
      (filterByApproval === 'approved' && student.isApproved) ||
      (filterByApproval === 'pending' && !student.isApproved);
    
    return matchesSearch && matchesApproval;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterByApproval]);

  useEffect(() => { fetchStudents(); }, []);

  const handleApprove = async (studentId) => {
    setLoading(true);
    try {
      // Use the general approve endpoint since we're working with User model
      await axios.post('http://localhost:5000/users/approve', { userId: studentId }, { withCredentials: true });
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    setLoading(true);
    try {
      // Use the general delete endpoint since we're working with User model
      await axios.delete('http://localhost:5000/users/delete', { data: { userId: studentId }, withCredentials: true });
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Student Management</h2>
      
      {loading && <div className="flex justify-center"><div className="text-indigo-600">Loading...</div></div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
            <input
              type="text"
              placeholder="Search by name, email, enrollment number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Approval</label>
            <select
              value={filterByApproval}
              onChange={(e) => setFilterByApproval(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Students</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {currentStudents.length} of {filteredStudents.length} students
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.map(student => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.enrollmentNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {canApproveStudent(currentUser, student) && !student.isApproved && (
                        <button 
                          onClick={() => handleApprove(student._id)} 
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition duration-200"
                        >
                          Approve
                        </button>
                      )}
                      {canApproveStudent(currentUser, student) && (
                        <>
                          <button 
                            onClick={() => openEditModal(student)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition duration-200"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(student._id)} 
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
        {currentStudents.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {filteredStudents.length === 0 ? 'No students found matching your criteria.' : 'No students on this page.'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-md">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                <span className="font-medium">{filteredStudents.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Student</h3>
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">First Name</span>
                <input 
                  type="text" 
                  name="firstName" 
                  value={editStudent.firstName || ''} 
                  onChange={handleEditChange} 
                  className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Last Name</span>
                <input 
                  type="text" 
                  name="lastName" 
                  value={editStudent.lastName || ''} 
                  onChange={handleEditChange} 
                  className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <input 
                  type="email" 
                  name="email" 
                  value={editStudent.email || ''} 
                  onChange={handleEditChange} 
                  className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Enrollment Number</span>
                <input 
                  type="text" 
                  name="enrollmentNumber" 
                  value={editStudent.enrollmentNumber || ''} 
                  onChange={handleEditChange} 
                  className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Department</span>
                <input 
                  type="text" 
                  name="department" 
                  value={editStudent.department || ''} 
                  onChange={handleEditChange} 
                  className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Branch</span>
                <input 
                  type="text" 
                  name="branch" 
                  value={editStudent.branch || ''} 
                  onChange={handleEditChange} 
                  className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Year</span>
                <input 
                  type="text" 
                  name="year" 
                  value={editStudent.year || ''} 
                  onChange={handleEditChange} 
                  className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={closeModal} 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
