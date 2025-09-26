import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ProfessorBranchManagement = () => {
  const [professors, setProfessors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const currentUser = useSelector((state) => state.currentUser);

  // Check user permissions
  if (!currentUser || (currentUser.role !== 'collegeadmin' && currentUser.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-2">Access Denied</div>
          <p className="text-gray-600">You don't have permission to manage professor branches.</p>
        </div>
      </div>
    );
  }

  // Fetch professors and branches
  const fetchData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Fetch professors
      const professorsResponse = await axios.get('http://localhost:5000/users/professors', {
        withCredentials: true
      });
      setProfessors(professorsResponse.data.data?.allProfessors || []);
      
      // Fetch branches
      const branchesResponse = await axios.get('http://localhost:5000/users/branches', {
        withCredentials: true
      });
      setBranches(branchesResponse.data.data?.branches || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleAssignProfessor = async (e) => {
    e.preventDefault();
    
    if (!selectedProfessor || !selectedBranch) {
      setMessage('Please select both a professor and a branch.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/users/assign-professor-branch', {
        professorId: selectedProfessor,
        branch: selectedBranch
      }, { withCredentials: true });

      setMessage(`Success: ${response.data.message}`);
      setSelectedProfessor('');
      setSelectedBranch('');
      
      // Refresh the data
      await fetchData();
      
    } catch (error) {
      console.error('Error assigning professor:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Professor Branch Management</h2>
        
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.startsWith('Success') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAssignProfessor} className="space-y-4 mb-6">
          <div>
            <label htmlFor="professor" className="block text-sm font-medium text-gray-700 mb-2">
              Select Professor
            </label>
            <select
              id="professor"
              value={selectedProfessor}
              onChange={(e) => setSelectedProfessor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Choose a professor...</option>
              {professors.map((prof) => (
                <option key={prof._id} value={prof._id}>
                  {prof.firstName} {prof.lastName} - {prof.email} ({prof.branch || 'No branch assigned'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
              Select Branch
            </label>
            <select
              id="branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Choose a branch...</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedProfessor || !selectedBranch}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Assigning...' : 'Assign Professor to Branch'}
          </button>
        </form>

        {/* Current Assignments Display */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Professor Assignments</h3>
          
          {loading && professors.length === 0 ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading professors...</p>
            </div>
          ) : professors.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No professors found in your department.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Professor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {professors.map((professor) => (
                    <tr key={professor._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {professor.firstName} {professor.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {professor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {professor.branch || (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {professor.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          professor.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {professor.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessorBranchManagement;