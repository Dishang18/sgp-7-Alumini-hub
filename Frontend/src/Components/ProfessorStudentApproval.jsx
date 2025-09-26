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
  ChartBarIcon,
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
      console.error('Error loading data:', error);
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
      console.error('Error fetching pending students:', error);
      toast.error('Failed to fetch pending students');
    }
  };

  const loadApprovedStudents = async () => {
    try {
      const response = await fetchApprovedStudents();
      setApprovedStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching approved students:', error);
      toast.error('Failed to fetch approved students');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchApprovalStats();
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    }
  };

  const handleStudentAction = async (studentId, action) => {
    try {
      setProcessingStudentId(studentId);
      await approveStudent(studentId, action);
      
      toast.success(`Student ${action}d successfully`);
      
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error(`Error ${action}ing student:`, error);
      toast.error(`Failed to ${action} student`);
    } finally {
      setProcessingStudentId(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const StudentCard = ({ student, showActions = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {student.user?.firstName} {student.user?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{student.user?.email}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Enrollment:</span> {student.enrollmentNumber}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Year:</span> {student.year}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Department:</span> {student.department}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Branch:</span> {student.branch}
              </p>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleStudentAction(student._id, 'approve')}
              disabled={processingStudentId === student._id}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {processingStudentId === student._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
              <span className="ml-1">Approve</span>
            </button>
            <button
              onClick={() => handleStudentAction(student._id, 'reject')}
              disabled={processingStudentId === student._id}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {processingStudentId === student._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <XMarkIcon className="h-4 w-4" />
              )}
              <span className="ml-1">Reject</span>
            </button>
          </div>
        )}
        
        {!showActions && student.approvedAt && (
          <div className="text-right">
            <p className="text-sm text-green-600 font-medium">Approved</p>
            <p className="text-xs text-gray-500">
              {new Date(student.approvedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (user?.role !== 'professor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Approval Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage student registration approvals for your department and branch
          </p>
          {stats.professorInfo && (
            <p className="mt-1 text-sm text-gray-500">
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
          />
          <StatCard
            title="Approved by Me"
            value={stats.totalApprovedByMe || 0}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Rejected by Me"
            value={stats.totalRejectedByMe || 0}
            icon={XCircleIcon}
            color="red"
          />
          <StatCard
            title="Total in Branch"
            value={stats.totalInMyBranch || 0}
            icon={UserGroupIcon}
            color="blue"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Students ({pendingStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                pendingStudents.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    showActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending students</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All students in your branch have been processed.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'approved' && (
            <>
              {approvedStudents.length > 0 ? (
                approvedStudents.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    showActions={false}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No approved students</h3>
                  <p className="mt-1 text-sm text-gray-500">
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