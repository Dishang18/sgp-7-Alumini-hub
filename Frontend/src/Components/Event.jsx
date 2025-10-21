import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import NotLoggedIn from './helper/NotLoggedIn';
import { fetchEvents, createEvent, updateEvent, deleteEvent, fetchCollegeAdmins, createEventRequest, fetchEventRequests, approveEventRequest, rejectEventRequest } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import { CalendarDaysIcon, MapPinIcon, PencilSquareIcon, ClockIcon, TrashIcon, PlusIcon, CalendarIcon, UserGroupIcon, BellIcon, CheckCircleIcon, XCircleIcon, BuildingOfficeIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

function Event() {
  // Always declare useSelector hooks first!
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Fetch incoming event requests for collegeadmin
  useEffect(() => {
    const loadRequests = async () => {
      if (user && user.role === 'collegeadmin') {
        setRequestLoading(true);
        setRequestError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetchEventRequests(token);
          // Only show requests where this admin is the target and status is pending
          const received = (res.data.data?.receivedRequests || res.data.data?.eventRequests || []).filter(r => r.status === 'pending');
          setIncomingRequests(received);
        } catch (err) {
          setRequestError('Failed to load event requests');
        }
        setRequestLoading(false);
      }
    };
    loadRequests();
  }, [user]);

  const handleApproveRequest = async (id) => {
    setRequestLoading(true);
    try {
      const token = localStorage.getItem('token');
      await approveEventRequest(id, token);
      toast.success('Event request approved!');
      setIncomingRequests(incomingRequests.filter(r => r._id !== id));
      // Always reload events for all users after approval
      await loadEvents();
    } catch (err) {
      toast.error('Failed to approve request');
    }
    setRequestLoading(false);
  };

  const handleRejectRequest = async (id) => {
    setRequestLoading(true);
    try {
      const token = localStorage.getItem('token');
      await rejectEventRequest(id, 'Rejected by admin', token);
      toast.success('Event request rejected!');
      setIncomingRequests(incomingRequests.filter(r => r._id !== id));
    } catch (err) {
      toast.error('Failed to reject request');
    }
    setRequestLoading(false);
  };
  const [events, setEvents] = useState([]);
  const [eventsMeta, setEventsMeta] = useState(null);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    description: '', 
    targetAudience: ['student'],
    branch: ''
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    description: '', 
    targetAudience: ['student'],
    branch: ''
  });
  const [collegeAdmins, setCollegeAdmins] = useState([]);
  const [selectedCollegeAdmins, setSelectedCollegeAdmins] = useState([]);

  useEffect(() => {
    if (user && user.role === 'collegeadmin') {
      fetchCollegeAdmins().then(res => {
        setCollegeAdmins(res.data.data.collegeAdmins || []);
      }).catch(() => setCollegeAdmins([]));
    }
  }, [user]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      loadEvents();
    }
  }, [loggedIn]);

  const loadEvents = async () => {
    try {
      console.log('🎯 Loading events...');
      const res = await fetchEvents();
      console.log('📅 Events response:', res.data);
      
      if (res.data && res.data.data && res.data.data.events) {
        setEvents(res.data.data.events);
        setEventsMeta(res.data.meta);
      } else if (res.data && res.data.events) {
        // Handle different response structure
        setEvents(res.data.events);
        setEventsMeta(res.data.meta);
      } else {
        console.warn('⚠️ Unexpected response structure:', res.data);
        setEvents([]);
      }
    } catch (error) {
      console.error('❌ Event fetch error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to view events');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view events');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch events');
      }
    }
  };

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleTargetAudienceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setNewEvent({ ...newEvent, targetAudience: [...newEvent.targetAudience, value] });
    } else {
      setNewEvent({ ...newEvent, targetAudience: newEvent.targetAudience.filter(audience => audience !== value) });
    }
  };

  const handleEditTargetAudienceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setEditForm({ ...editForm, targetAudience: [...editForm.targetAudience, value] });
    } else {
      setEditForm({ ...editForm, targetAudience: editForm.targetAudience.filter(audience => audience !== value) });
    }
  };

  const handleCollegeAdminSelect = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCollegeAdmins([...selectedCollegeAdmins, value]);
    } else {
      setSelectedCollegeAdmins(selectedCollegeAdmins.filter(id => id !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Always create event for creator's own college
      await createEvent(newEvent, token);
      toast.success('Event created!');
      // If invitations are selected, send event requests to other college admins
      if (user.role === 'collegeadmin' && selectedCollegeAdmins.length > 0) {
        await Promise.all(selectedCollegeAdmins.map(targetId =>
          createEventRequest({
            targetCollegeAdminId: targetId,
            title: newEvent.title,
            date: newEvent.date,
            location: newEvent.location,
            description: newEvent.description,
            targetAudience: newEvent.targetAudience,
            branch: newEvent.branch
          }, token)
        ));
        toast.success('Event invitation(s) sent!');
      }
      setNewEvent({ title: '', date: '', location: '', description: '', targetAudience: ['student'], branch: '' });
      setSelectedCollegeAdmins([]);
      await loadEvents();
    } catch (err) {
      console.error('Create event error:', err);
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
    setLoading(false);
  };

  const canCreate = user && (user.role === 'collegeadmin' || user.role === 'professor' || user.role === 'admin');
  const isAdmin = user && (user.role === 'admin' || user.role === 'collegeadmin');

  const handleManualCleanup = async () => {
    if (!window.confirm('Are you sure you want to manually clean up expired events? This will remove all events that have passed their date.')) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/events/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include'
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        await loadEvents();
      } else {
        toast.error(result.message || 'Failed to cleanup events');
      }
    } catch (error) {
      toast.error('Failed to cleanup events');
    }
    setLoading(false);
  };

  const canEditOrDelete = (ev) => {
    if (!user || !(user.role === 'collegeadmin' || user.role === 'professor' || user.role === 'admin')) return false;
    
    // Admin can edit/delete all events
    if (user.role === 'admin') return true;
    
    // Others can only edit/delete their own events
    const createdById = ev.createdBy && (ev.createdBy._id || ev.createdBy);
    return createdById === user._id;
  };

  const handleEditClick = (ev) => {
    setEditId(ev._id);
    setEditForm({
      title: ev.title,
      date: ev.date ? ev.date.slice(0, 10) : '',
      location: ev.location,
      description: ev.description,
      targetAudience: ev.targetAudience || ['student'],
      branch: ev.branch || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateEvent(editId, editForm);
      toast.success('Event updated!');
      setShowEditModal(false);
      setEditId(null);
      await loadEvents();
    } catch (err) {
      toast.error('Failed to update event');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      await deleteEvent(id);
      toast.success('Event deleted!');
      await loadEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
    setLoading(false);
  };

  return loggedIn ? (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>Event Management System - Create and Manage College Events</h1>
        <p>Professional event management platform for colleges and universities. Create, manage, and organize academic events, workshops, and seminars.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Event Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create, manage, and organize academic events, workshops, and seminars for your institution
            </p>
          </div>
        </div>

        {/* Incoming Event Requests for College Admins */}
        {user && user.role === 'collegeadmin' && incomingRequests.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center">
                  <BellIcon className="h-6 w-6 text-white mr-3" />
                  <h2 className="text-xl font-semibold text-white">
                    Pending Event Invitations ({incomingRequests.length})
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {requestLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    <span className="ml-3 text-gray-600">Loading requests...</span>
                  </div>
                )}
                {requestError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{requestError}</p>
                  </div>
                )}
                <div className="space-y-4">
                  {incomingRequests.map(req => (
                    <div key={req._id} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-3">
                            <CalendarDaysIcon className="h-5 w-5 text-amber-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">{req.eventDetails.title}</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>From: {req.requester?.firstName} {req.requester?.lastName}</span>
                            </div>
                            <div className="flex items-center">
                              <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{req.requester?.collegeName}</span>
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{new Date(req.eventDetails.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{req.eventDetails.location}</span>
                            </div>
                          </div>
                          {req.eventDetails.description && (
                            <p className="mt-3 text-sm text-gray-700 line-clamp-2">{req.eventDetails.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 mt-4 lg:mt-0 lg:ml-6">
                          <button 
                            onClick={() => handleApproveRequest(req._id)}
                            disabled={requestLoading}
                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(req._id)}
                            disabled={requestLoading}
                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Create Event Form */}
          {canCreate && (
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center">
                    <PlusIcon className="h-6 w-6 text-white mr-3" />
                    <h2 className="text-xl font-semibold text-white">Create New Event</h2>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Invite Other Colleges (only for collegeadmin) */}
                  {user && user.role === 'collegeadmin' && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <label className="block text-sm font-semibold text-blue-900 mb-3">
                        <UserGroupIcon className="h-4 w-4 inline mr-2" />
                        Invite Other College Admins
                      </label>
                      <div className="max-h-32 overflow-y-auto bg-white rounded-lg border border-blue-200 p-3">
                        {collegeAdmins.filter(admin => admin.collegeName !== user.collegeName && admin._id !== user._id).length === 0 ? (
                          <div className="text-gray-500 text-sm text-center py-2">No other college admins found.</div>
                        ) : (
                          <div className="space-y-2">
                            {collegeAdmins
                              .filter(admin => admin.collegeName !== user.collegeName && admin._id !== user._id)
                              .map(admin => (
                                <label key={admin._id} className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                                  <input
                                    type="checkbox"
                                    value={admin._id}
                                    checked={selectedCollegeAdmins.includes(admin._id)}
                                    onChange={handleCollegeAdminSelect}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {admin.firstName} {admin.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">{admin.collegeName}</div>
                                  </div>
                                </label>
                              ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        Select college admins to invite. If none selected, event will be created only for your college.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
                    <input 
                      name="title" 
                      value={newEvent.title} 
                      onChange={handleChange} 
                      placeholder="Enter event title" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                    <input 
                      name="date" 
                      value={newEvent.date} 
                      onChange={handleChange} 
                      type="date" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                    <input 
                      name="location" 
                      value={newEvent.location} 
                      onChange={handleChange} 
                      placeholder="Enter event location" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Target Audience *</label>
                    <div className="space-y-3">
                      {['student', 'alumni', 'professor'].map((audience) => (
                        <label key={audience} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                          <input
                            type="checkbox"
                            name="targetAudience"
                            value={audience}
                            checked={newEvent.targetAudience.includes(audience)}
                            onChange={handleTargetAudienceChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 capitalize">{audience}s</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Branch (Optional)</label>
                    <input 
                      name="branch" 
                      value={newEvent.branch} 
                      onChange={handleChange} 
                      placeholder="Specific branch" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea 
                      name="description" 
                      value={newEvent.description} 
                      onChange={handleChange} 
                      placeholder="Enter event description" 
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Creating Event...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Event
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Events List */}
          <div className={canCreate ? 'xl:col-span-2' : 'xl:col-span-3'}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="h-6 w-6 text-white mr-3" />
                    <h2 className="text-xl font-semibold text-white">
                      {events.length > 0 ? `Upcoming Events` : 'No Events Found'}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {events.length} Events
                    </div>
                    {isAdmin && eventsMeta && (
                      <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm">
                        Total: {eventsMeta.totalEvents}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {events.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">No Active Events</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {canCreate ? 'Create your first event to get started and engage your community.' : 'Check back later for new events and exciting opportunities.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {events.map(ev => (
                      <div key={ev._id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-4">
                              <div className="bg-blue-100 rounded-full p-2 mr-3">
                                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                  {ev.title}
                                </h3>
                                {isAdmin && ev.organizedBy && ev.organizedBy.role === 'collegeadmin' && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                    <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                    College Admin
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center text-gray-600">
                                <ClockIcon className="h-4 w-4 mr-3 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {new Date(ev.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPinIcon className="h-4 w-4 mr-3 text-gray-400" />
                                <span className="text-sm font-medium">{ev.location}</span>
                              </div>
                            </div>

                            {ev.description && (
                              <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">{ev.description}</p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {ev.department && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <AcademicCapIcon className="h-3 w-3 mr-1" />
                                  {ev.department}
                                </span>
                              )}
                              {ev.branch && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Branch: {ev.branch}
                                </span>
                              )}
                              {ev.targetAudience && ev.targetAudience.length > 0 && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <UserGroupIcon className="h-3 w-3 mr-1" />
                                  {ev.targetAudience.join(', ')}
                                </span>
                              )}
                              {ev.organizedBy && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  By: {ev.organizedBy.name} ({ev.organizedBy.role})
                                </span>
                              )}
                            </div>
                          </div>

                          {canEditOrDelete(ev) && (
                            <div className="flex items-center space-x-3 mt-6 lg:mt-0 lg:ml-6">
                              <button
                                onClick={() => handleEditClick(ev)}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <PencilSquareIcon className="h-4 w-4 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(ev._id)}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center">
                  <PencilSquareIcon className="h-6 w-6 text-white mr-3" />
                  <h3 className="text-xl font-semibold text-white">Edit Event</h3>
                </div>
              </div>
              <form onSubmit={handleEditSubmit} className="px-6 py-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
                  <input 
                    name="title" 
                    value={editForm.title} 
                    onChange={handleEditChange} 
                    placeholder="Enter event title" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input 
                    name="date" 
                    value={editForm.date} 
                    onChange={handleEditChange} 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <input 
                    name="location" 
                    value={editForm.location} 
                    onChange={handleEditChange} 
                    placeholder="Enter event location" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Target Audience *</label>
                  <div className="space-y-3">
                    {['student', 'alumni', 'professor'].map((audience) => (
                      <label key={audience} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                        <input
                          type="checkbox"
                          name="targetAudience"
                          value={audience}
                          checked={editForm.targetAudience.includes(audience)}
                          onChange={handleEditTargetAudienceChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 capitalize">{audience}s</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Branch (Optional)</label>
                  <input 
                    name="branch" 
                    value={editForm.branch} 
                    onChange={handleEditChange} 
                    placeholder="Specific branch"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    value={editForm.description} 
                    onChange={handleEditChange} 
                    placeholder="Enter event description" 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none" 
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <NotLoggedIn />
  );
}

export default Event;