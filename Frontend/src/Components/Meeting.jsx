import React, { useState, useEffect } from 'react';
import { getLoggedIn, getUserData } from "../services/authService";
import { fetchMeetings, fetchAlumniList, createMeetingRequest, approveMeeting, rejectMeeting } from '../services/api';
import apiClient from '../config/apiClient';
import { ToastContainer, toast } from 'react-toastify';
import NotLoggedIn from './helper/NotLoggedIn';
import { VideoCameraIcon, CalendarDaysIcon, LinkIcon, PencilSquareIcon, PlusIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const Meeting = () => {
  const loggedIn = getLoggedIn();
  const user = getUserData();
  const [meetings, setMeetings] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, meeting: null });
  const [editForm, setEditForm] = useState({ title: '', description: '', meetingLink: '', date: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, meeting: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [form, setForm] = useState({ title: '', description: '', meetingLink: '', date: '', alumni: '' });
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle edit form changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Open edit modal and populate form
  const openEditModal = (meeting) => {
    setEditForm({
      title: meeting.title || '',
      description: meeting.description || '',
      meetingLink: meeting.meetingLink || '',
      date: meeting.date ? meeting.date.slice(0, 16) : '',
    });
    setEditModal({ open: true, meeting });
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModal({ open: false, meeting: null });
  };

  // Open reject modal
  const openRejectModal = (meeting) => {
    setRejectModal({ open: true, meeting });
    setRejectionReason('');
  };

  // Close reject modal
  const closeRejectModal = () => {
    setRejectModal({ open: false, meeting: null });
    setRejectionReason('');
  };

  // Submit rejection with reason
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setLoading(true);
    try {
      await rejectMeeting(rejectModal.meeting._id, rejectionReason.trim());
      toast.success('Meeting rejected with reason!');
      const res = await fetchMeetings();
      setMeetings(res.data.meetings || res.data.data?.meetings || []);
      closeRejectModal();
    } catch {
      toast.error('Failed to reject meeting');
    }
    setLoading(false);
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put(`/meeting/${editModal.meeting._id}`, editForm);
      toast.success('Meeting updated!');
      const res = await fetchMeetings();
      setMeetings(res.data.meetings || res.data.data?.meetings || []);
      closeEditModal();
    } catch {
      toast.error('Failed to update meeting');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (loggedIn) {
      fetchMeetings()
        .then(res => setMeetings(res.data.meetings || res.data.data?.meetings || []))
        .catch(() => toast.error('Failed to fetch meetings'));
      if (user && (user.role === 'professor' || user.role === 'collegeadmin')) {
        fetchAlumniList()
          .then(res => setAlumniList(res.data.data.alumni || []))
          .catch(() => toast.error('Failed to fetch alumni list'));
      }
    }
  }, [loggedIn]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMeetingRequest(form);
      toast.success('Meeting request sent!');
      setForm({ title: '', description: '', meetingLink: '', date: '', alumni: '' });
      // Refresh meetings
      const res = await fetchMeetings();
      setMeetings(res.data.meetings || res.data.data?.meetings || []);
    } catch (err) {
      toast.error('Failed to create meeting');
    }
    setLoading(false);
  };

  const canCreate = user && (user.role === 'professor' || user.role === 'collegeadmin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 p-6">
      <ToastContainer />
      {loggedIn ? (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center">
              <VideoCameraIcon className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Meeting Management</h1>
                <p className="text-gray-600 mt-1">Schedule and manage meetings with alumni</p>
              </div>
            </div>
          </div>
          {/* Info messages */}
          {user?.role === 'collegeadmin' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-4xl">
              {/* <p className="text-sm text-blue-800">
                <strong>College Admin:</strong> You can only create meetings with alumni from your department: <strong>{user.department}</strong>
              </p> */}
              {/* <p className="text-sm text-blue-700 mt-1">
                Alumni are required to provide reasons when rejecting meetings, which will be displayed in rejected meeting cards.
              </p> */}
            </div>
          )}
          
          {user?.role === 'professor' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl max-w-4xl">
              <p className="text-sm text-green-800">
                <strong>Professor:</strong> You can only create meetings with alumni from your department ({user.department}) and branch ({user.branch})
              </p>
            </div>
          )}
          
          {user?.role === 'student' && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl max-w-4xl">
              <p className="text-sm text-purple-800">
                <strong>Student:</strong> You can see approved meetings from your department: <strong>{user.department}</strong>
              </p>
            </div>
          )}
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Meeting Form - Sidebar */}
            {canCreate && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 border border-gray-200">
                  <div className="flex items-center mb-6">
                    <PlusIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Create Meeting Request</h2>
                  </div>
                  
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title *</label>
                      <input 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        placeholder="Enter meeting title" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
                      <input 
                        name="date" 
                        value={form.date} 
                        onChange={handleChange} 
                        type="datetime-local" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link *</label>
                      <input 
                        name="meetingLink" 
                        value={form.meetingLink} 
                        onChange={handleChange} 
                        placeholder="Meeting Link (e.g. Zoom/Meet)" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alumni *</label>
                      <select 
                        name="alumni" 
                        value={form.alumni} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        required
                      >
                        <option value="">Select Alumni</option>
                        {alumniList.map(a => (
                          <option key={a._id} value={a._id}>{a.fullName} ({a.email})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        placeholder="Enter meeting description" 
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                      disabled={loading}
                    >
                      {loading ? 'Sending Request...' : 'Send Request'}
                    </button>
                  </form>
                </div>
              </div>
            )}
            {/* Meetings List */}
            <div className={canCreate ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <VideoCameraIcon className="h-6 w-6 text-gray-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        {meetings.length > 0 ? `Meetings` : 'No Meetings Found'}
                      </h2>
                    </div>
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {meetings.length} Meetings
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {meetings.length === 0 ? (
                    <div className="text-center py-12">
                      <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No meetings found</h3>
                      <p className="text-gray-500">
                        {canCreate ? 'Create your first meeting request to get started.' : 'Check back later for new meetings.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meetings.map(m => (
                        <div key={m._id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:bg-gray-100">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">{m.title}</h3>
                                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  m.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  m.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center text-gray-600">
                                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{new Date(m.date).toLocaleString()}</span>
                                </div>
                                
                                {/* Department Information */}
                                {(m.createdBy?.department || m.alumni?.department) && (
                                  <div className="flex items-center text-gray-600">
                                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                                    <span className="text-sm">Department: {m.createdBy?.department || m.alumni?.department}</span>
                                  </div>
                                )}
                                
                                {/* Alumni Information */}
                                {m.alumni && (
                                  <div className="flex items-center text-gray-600">
                                    <UserGroupIcon className="h-4 w-4 mr-2" />
                                    <span className="text-sm">With: {m.alumni.fullName || m.alumni.firstName + ' ' + m.alumni.lastName}</span>
                                  </div>
                                )}
                                
                                {m.description && (
                                  <p className="text-sm text-gray-600 leading-relaxed">{m.description}</p>
                                )}
                              </div>
                              
                              {/* Join Meeting Button for approved meetings */}
                              {m.status === 'approved' && m.meetingLink && (
                                <div className="mb-3">
                                  <a 
                                    href={m.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                                  >
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Join Meeting
                                  </a>
                                </div>
                              )}
                              
                              {/* Show rejection reason if meeting is rejected */}
                              {m.status === 'rejected' && m.rejectionReason && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm text-red-800">
                                    <strong>Rejection Reason:</strong> {m.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                                              
                            {/* Action Buttons */}
                            <div className="flex flex-col lg:flex-row lg:items-start space-y-2 lg:space-y-0 lg:space-x-2 mt-4 lg:mt-0 lg:ml-4">
                              {/* Alumni can approve/reject their own meeting requests */}
                              {user && user.role === 'alumni' && m.alumni && (m.alumni._id === user._id || m.alumni === user._id) && m.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button 
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md" 
                                    onClick={async () => {
                                      setLoading(true);
                                      try {
                                        await approveMeeting(m._id);
                                        toast.success('Meeting approved!');
                                        const res = await fetchMeetings();
                                        setMeetings(res.data.meetings || res.data.data?.meetings || []);
                                      } catch {
                                        toast.error('Failed to approve meeting');
                                      }
                                      setLoading(false);
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md" 
                                    onClick={() => openRejectModal(m)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              
                              {/* Creator can edit/delete their own meeting */}
                              {user && m.createdBy && (m.createdBy._id === user._id || m.createdBy === user._id) && (
                                <div className="flex space-x-2">
                                  <button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md" 
                                    onClick={() => openEditModal(m)}
                                  >
                                    <PencilSquareIcon className="h-4 w-4 mr-1 inline" />
                                    Edit
                                  </button>
                                  <button 
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md" 
                                    onClick={async () => {
                                      if (!window.confirm('Are you sure you want to delete this meeting?')) return;
                                      setLoading(true);
                                      try {
                                        await apiClient.delete(`/meeting/${m._id}`);
                                        toast.success('Meeting deleted!');
                                        const res = await fetchMeetings();
                                        setMeetings(res.data.meetings || res.data.data?.meetings || []);
                                      } catch {
                                        toast.error('Failed to delete meeting');
                                      }
                                      setLoading(false);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>

        {/* Edit Meeting Modal */}
        {editModal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeEditModal}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <PencilSquareIcon className="h-6 w-6 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Edit Meeting</h3>
                  </div>
                </div>
                
                <form onSubmit={handleEditSubmit} className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={editForm.title} 
                      onChange={handleEditChange} 
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      name="date" 
                      value={editForm.date} 
                      onChange={handleEditChange} 
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link *</label>
                    <input 
                      type="text" 
                      name="meetingLink" 
                      value={editForm.meetingLink} 
                      onChange={handleEditChange} 
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      name="description" 
                      value={editForm.description} 
                      onChange={handleEditChange} 
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={closeEditModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" 
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reject Meeting Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeRejectModal}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-red-200">
                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                  <h3 className="text-lg font-semibold text-red-800">Reject Meeting</h3>
                </div>
                
                <form onSubmit={handleRejectSubmit} className="px-6 py-4">
                  <p className="text-gray-600 mb-4">
                    Please provide a reason for rejecting this meeting request. This will help the college admin understand your decision.
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                    <textarea 
                      value={rejectionReason} 
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      rows="4"
                      placeholder="e.g., Time conflict, Not available on that date, Different expertise needed..."
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={closeRejectModal} 
                      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" 
                      disabled={loading}
                    >
                      {loading ? 'Rejecting...' : 'Reject Meeting'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        </div>
      ) : (
        <NotLoggedIn text="Meeting" redirectTo="/meeting" />
      )}
    </div>
  );
};

export default Meeting;