import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchPendingStudents,
  fetchApprovedStudents,
  fetchApprovalStats,
  approveStudent
} from '../services/api';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ProfessorStudentApproval = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingStudents, setPendingStudents] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingStudentId, setProcessingStudentId] = useState(null);

  const user = useSelector((state) => state.currentUser);

  useEffect(() => {
    if (user?.role === 'professor') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPendingStudents(),
        loadApprovedStudents(),
        loadStats()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingStudents = async () => {
    try {
      const response = await fetchPendingStudents();
      setPendingStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending students');
    }
  };

  const loadApprovedStudents = async () => {
    try {
      const response = await fetchApprovedStudents();
      setApprovedStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch approved students');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchApprovalStats();
      setStats(response.data.data || {});
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const handleStudentAction = async (studentId, action) => {
    try {
      setProcessingStudentId(studentId);
      await approveStudent(studentId, action);
      toast.success(`Student ${action}d successfully`);
      await loadData();
    } catch (error) {
      toast.error(`Failed to ${action} student`);
    } finally {
      setProcessingStudentId(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', bg = 'bg-gradient-to-br from-cyan-100 via-blue-100 to-blue-50' }) => (
    <div className={`rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col items-center justify-center ${bg}`}>
      <div className={`p-3 rounded-full bg-white flex items-center justify-center shadow`}>
        <Icon className={`h-7 w-7 text-${color}-500`} />
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  // Responsive Table with unique colors
  const StudentTable = ({ students, showActions }) => (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full rounded-xl shadow-lg border border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
        <thead>
          <tr className="bg-gradient-to-r from-blue-200 via-cyan-100 to-blue-50">
            <th className="px-3 py-3 text-left text-xs font-bold text-cyan-700">Name</th>
            <th className="px-3 py-3 text-left text-xs font-bold text-cyan-700">Email</th>
            <th className="px-3 py-3 text-left text-xs font-bold text-cyan-700">Enrollment</th>
            <th className="px-3 py-3 text-left text-xs font-bold text-cyan-700">Year</th>
            <th className="px-3 py-3 text-left text-xs font-bold text-cyan-700">Department</th>
            <th className="px-3 py-3 text-left text-xs font-bold text-cyan-700">Branch</th>
            {showActions && <th className="px-3 py-3 text-center text-xs font-bold text-cyan-700">Actions</th>}
            {!showActions && <th className="px-3 py-3 text-center text-xs font-bold text-cyan-700">Status</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id} className="border-t border-blue-100 hover:bg-cyan-50 transition">
              <td className="px-3 py-2 whitespace-nowrap">{student.user?.firstName} {student.user?.lastName}</td>
              <td className="px-3 py-2 whitespace-nowrap">{student.user?.email}</td>
              <td className="px-3 py-2 whitespace-nowrap">{student.enrollmentNumber}</td>
              <td className="px-3 py-2 whitespace-nowrap">{student.year}</td>
              <td className="px-3 py-2 whitespace-nowrap">{student.department}</td>
              <td className="px-3 py-2 whitespace-nowrap">{student.branch}</td>
              {showActions ? (
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <button
                    onClick={() => handleStudentAction(student._id, 'approve')}
                    disabled={processingStudentId === student._id}
                    className="inline-flex items-center px-3 py-1 mr-2 text-xs font-semibold rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow hover:scale-105 transition disabled:opacity-50"
                  >
                    {processingStudentId === student._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleStudentAction(student._id, 'reject')}
                    disabled={processingStudentId === student._id}
                    className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-pink-400 via-red-500 to-red-600 text-white shadow hover:scale-105 transition disabled:opacity-50"
                  >
                    {processingStudentId === student._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <XMarkIcon className="h-4 w-4 mr-1" />
                    )}
                    Reject
                  </button>
                </td>
              ) : (
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {student.approvedAt ? (
                    <span className="inline-flex items-center text-green-600 font-semibold">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-yellow-500 font-semibold">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Pending
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (user?.role !== 'professor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            This page is only accessible to professors.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-7xl px-2 sm:px-6 lg:px-8 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-700">Student Approval Management</h1>
          <p className="mt-2 text-sm text-blue-600">
            Manage student registration approvals for your department and branch
          </p>
          {stats.professorInfo && (
            <p className="mt-1 text-sm text-blue-500">
              Department: <span className="font-medium">{stats.professorInfo.department}</span> | 
              Branch: <span className="font-medium">{stats.professorInfo.branch}</span>
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Approvals"
            value={stats.totalPending || 0}
            icon={ClockIcon}
            color="yellow"
            bg="bg-gradient-to-br from-yellow-100 via-yellow-50 to-white"
          />
          <StatCard
            title="Approved by Me"
            value={stats.totalApprovedByMe || 0}
            icon={CheckCircleIcon}
            color="green"
            bg="bg-gradient-to-br from-green-100 via-green-50 to-white"
          />
          <StatCard
            title="Rejected by Me"
            value={stats.totalRejectedByMe || 0}
            icon={XCircleIcon}
            color="pink"
            bg="bg-gradient-to-br from-pink-100 via-pink-50 to-white"
          />
          <StatCard
            title="Total in Branch"
            value={stats.totalInMyBranch || 0}
            icon={UserGroupIcon}
            color="cyan"
            bg="bg-gradient-to-br from-cyan-100 via-blue-50 to-white"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-blue-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-cyan-500 text-cyan-700'
                  : 'border-transparent text-cyan-500 hover:text-cyan-700 hover:border-cyan-300'
              }`}
            >
              Pending Students ({pendingStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-cyan-500 text-cyan-700'
                  : 'border-transparent text-cyan-500 hover:text-cyan-700 hover:border-cyan-300'
              }`}
            >
              Approved Students ({approvedStudents.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'pending' && (
            <>
              {pendingStudents.length > 0 ? (
                <StudentTable students={pendingStudents} showActions={true} />
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-cyan-700">No pending students</h3>
                  <p className="mt-1 text-sm text-blue-500">
                    All students in your branch have been processed.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'approved' && (
            <>
              {approvedStudents.length > 0 ? (
                <StudentTable students={approvedStudents} showActions={false} />
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-cyan-700">No approved students</h3>
                  <p className="mt-1 text-sm text-blue-500">
                    You haven't approved any students yet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessorStudentApproval;