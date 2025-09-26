import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProfessorAlumniManagement() {
  const loggedIn = useSelector((state) => state.loggedIn);
  const currentUser = useSelector((state) => state.currentUser);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlumni = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/users/alumni-management', { withCredentials: true });
      setAlumni(res.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAlumni(); }, []);

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser?.role !== 'professor') {
    return <div className="text-red-600 text-center mt-8">Access denied. Only professors can manage alumni of their department and branch.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 px-2">
      <h2 className="text-2xl font-bold mb-4">Alumni Management (Your Department & Branch)</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Department</th>
              <th className="py-2 px-4 border">Branch</th>
              <th className="py-2 px-4 border">Approved</th>
            </tr>
          </thead>
          <tbody>
            {alumni.map(a => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{a.firstName} {a.lastName}</td>
                <td className="py-2 px-4 border">{a.email}</td>
                <td className="py-2 px-4 border">{a.department}</td>
                <td className="py-2 px-4 border">{a.branch}</td>
                <td className="py-2 px-4 border">{a.isApproved ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
