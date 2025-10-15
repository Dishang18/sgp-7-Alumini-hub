import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import { getLoggedIn, getUserData } from '../services/authService';
import NotLoggedIn from './helper/NotLoggedIn';
import { bulkImport } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import { DocumentArrowUpIcon } from '@heroicons/react/24/solid';

const BulkUpload = () => {
  const loggedIn = getLoggedIn();
  const user = getUserData();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('role', role);
    try {
      const res = await bulkImport(formData);
      setResult(res.data);
      toast.success('File uploaded and data imported!');
      setSelectedFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import data');
    }
    setLoading(false);
  };

  // Only show for collegeadmin or admin
  if (!loggedIn || !(user?.role === 'collegeadmin' || user?.role === 'admin')) {
    return <NotLoggedIn text="Bulk Import (CollegeAdmin/Admin only)" redirectTo="/bulk-upload" />;
  }
  // CSV column instructions for each role
  const csvInstructions = {
    student: 'Required columns: email, password, firstName, lastName, enrollmentNumber, department, branch, year',
    alumni: 'Required columns: email, password, firstName, lastName, startYear, endYear, degree, department, branch, rollNumber',
    professor: 'Required columns: email, password, firstName, lastName, department',
    collegeadmin: 'Required columns: email, password, firstName, lastName, department',
    admin: 'Required columns: email, password, firstName, lastName, adminName',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-8">
      <ToastContainer />
      <form onSubmit={handleUpload} encType='multipart/form-data' className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border-l-4 border-blue-400 mt-12">
        <h2 className="text-2xl font-extrabold mb-6 text-center text-blue-700 flex items-center justify-center">
          <DocumentArrowUpIcon className="h-7 w-7 text-blue-400 mr-2" />
          Bulk Import Users
        </h2>
        <div className="mb-4">
          <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-600 mb-2">Select User Role</label>
          <select id="roleSelect" value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-md">
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="professor">Professor</option>
            <option value="collegeadmin">College Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mb-2">
          <span className="text-xs text-blue-700 font-semibold">{csvInstructions[role]}</span>
        </div>
        <div className="mb-6">
          <label htmlFor="fileInput" className="block text-sm font-medium text-gray-600 mb-2">
            Choose a file
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300"
            onChange={handleFileChange}
          />
          <span className="text-xs text-gray-500 mt-2 block">
            Only CSV files are supported. Download sample:{" "}
            <a
              href="/TestFiles/registerStudent.csv"
              className="text-blue-600 underline"
              download
            >
              registerStudent.csv
            </a>
          </span>
        </div>
        {selectedFile && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Selected File:</h4>
            <p className="text-gray-600">{selectedFile.name}</p>
          </div>
        )}
        <button
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          type='submit'
          disabled={loading}
        >
          <FaUpload className="inline-block mr-2 mt-1" />
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        {result && (
          <div className="mt-6">
            <h4 className="font-bold mb-2">Import Result:</h4>
            <div className="text-green-700">Imported: {result.imported}</div>
            {result.errors && result.errors.length > 0 && (
              <div className="text-red-600 mt-2">
                <div>Errors:</div>
                <ul className="list-disc ml-6">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>{err.row?.email || 'Row'}: {err.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default BulkUpload;