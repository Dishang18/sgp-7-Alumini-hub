import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CheckCircleIcon, XCircleIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const BranchManagerManagement = () => {
  const [professors, setProfessors] = useState([]);
  const [branchManagers, setBranchManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const currentUser = useSelector((state) => state.currentUser);

  // Fetch professors in the department
  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/users/professors', {
        withCredentials: true
      });
      setProfessors(response.data.data.allProfessors || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch professors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current branch managers
  const fetchBranchManagers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users/branch-managers', {
        withCredentials: true
      });
      setBranchManagers(response.data.data.branchManagers || []);
    } catch (err) {
      console.error('Failed to fetch branch managers:', err);
    }
  };

  // Assign professor as branch manager
  const assignBranchManager = async (professorId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/users/assign-branch-manager', 
        { professorId },
        { withCredentials: true }
      );
      
      setSuccess(response.data.message);
      await fetchProfessors();
      await fetchBranchManagers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign branch manager');
    } finally {
      setLoading(false);
    }
  };

  // Remove branch manager assignment
  const removeBranchManager = async (professorId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/users/remove-branch-manager', 
        { professorId },
        { withCredentials: true }
      );
      
      setSuccess(response.data.message);
      await fetchProfessors();
      await fetchBranchManagers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove branch manager');
    } finally {
      setLoading(false);
    }
  };

  // Check if professor is already a branch manager
  const isBranchManager = (professorId) => {
    return branchManagers.some(manager => manager.user._id === professorId);
  };

  useEffect(() => {
    fetchProfessors();
    fetchBranchManagers();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'collegeadmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 flex flex-col items-center p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Branch Manager Assignment
          </h1>
          <p className="text-gray-600">
            Assign professors as branch managers to approve student requests within their branches.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Branch Managers */}
        {branchManagers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
              Current Branch Managers
            </h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {branchManagers.map((manager) => (
                  <div key={manager._id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {manager.user.firstName} {manager.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{manager.user.email}</p>
                        <p className="text-sm text-green-700 font-medium">
                          {manager.branch} Branch
                        </p>
                        <p className="text-xs text-gray-500">
                          {manager.department} Department
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <ShieldCheckIcon className="h-8 w-8 text-green-600 mb-2" />
                        <button
                          onClick={() => removeBranchManager(manager.user._id)}
                          disabled={loading}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Professors */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-6 w-6 text-gray-600 mr-2" />
            All Professors in Department
          </h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          {!loading && professors.length === 0 && (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No professors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No professors are currently assigned to your department.
              </p>
            </div>
          )}

          {!loading && professors.length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Professor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {professors.map((professor) => {
                      const isManager = isBranchManager(professor._id);
                      return (
                        <tr key={professor._id} className={isManager ? 'bg-green-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {professor.firstName?.[0]}{professor.lastName?.[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {professor.firstName} {professor.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {professor.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{professor.branch}</div>
                            <div className="text-sm text-gray-500">{professor.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isManager 
                                ? 'bg-green-100 text-green-800' 
                                : professor.isApproved 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isManager ? (
                                <>
                                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                  Branch Manager
                                </>
                              ) : professor.isApproved ? (
                                'Approved Professor'
                              ) : (
                                'Pending Approval'
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {professor.isApproved && (
                              <button
                                onClick={() => isManager ? removeBranchManager(professor._id) : assignBranchManager(professor._id)}
                                disabled={loading}
                                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md disabled:opacity-50 ${
                                  isManager
                                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                                    : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                              >
                                {isManager ? 'Remove Manager' : 'Assign as Manager'}
                              </button>
                            )}
                            {!professor.isApproved && (
                              <span className="text-gray-400 text-sm">
                                Awaiting approval
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchManagerManagement;