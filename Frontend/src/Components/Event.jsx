import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import NotLoggedIn from './helper/NotLoggedIn';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import { CalendarDaysIcon, MapPinIcon, PencilSquareIcon, ClockIcon, TrashIcon, PlusIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/solid';

function Event() {
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);
  const [events,setEvents] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvent(newEvent);
      toast.success('Event created!');
      setNewEvent({ title: '', date: '', location: '', description: '', targetAudience: ['student'], branch: '' });
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

  return (
    <>
      {loggedIn ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-gray-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Event Management</h1>
                  <p className="text-gray-600 mt-1">Create and manage events for your institution</p>
                </div>
              </div>
            </div>          {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Event Form - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <PlusIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Create New Event</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input 
                    name="title" 
                    value={newEvent.title} 
                    onChange={handleChange} 
                    placeholder="Enter event title" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input 
                    name="date" 
                    value={newEvent.date} 
                    onChange={handleChange} 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input 
                    name="location" 
                    value={newEvent.location} 
                    onChange={handleChange} 
                    placeholder="Enter event location" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience *</label>
                  <div className="space-y-2">
                    {['student', 'alumni', 'professor'].map((audience) => (
                      <label key={audience} className="flex items-center">
                        <input
                          type="checkbox"
                          name="targetAudience"
                          value={audience}
                          checked={newEvent.targetAudience.includes(audience)}
                          onChange={handleTargetAudienceChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                        />
                        <span className="ml-3 text-sm text-gray-700 capitalize">{audience}s</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch (Optional)</label>
                  <input 
                    name="branch" 
                    value={newEvent.branch} 
                    onChange={handleChange} 
                    placeholder="Specific branch" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    value={newEvent.description} 
                    onChange={handleChange} 
                    placeholder="Enter event description" 
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                  disabled={loading}
                >
                  {loading ? 'Creating Event...' : 'Create Event'}
                </button>
              </form>
            </div>
          </div>

            {/* Events List */}
            <div className={canCreate ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="h-6 w-6 text-gray-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        {events.length > 0 ? `Upcoming Events` : 'No Events Found'}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {events.length} Events
                      </div>
                      {isAdmin && eventsMeta && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          Total: {eventsMeta.totalEvents}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No active events</h3>
                      <p className="text-gray-500">
                        {canCreate ? 'Create your first event to get started.' : 'Check back later for new events.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map(ev => (
                        <div key={ev._id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:bg-gray-100">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-800 truncate">{ev.title}</h3>
                                {isAdmin && ev.organizedBy && ev.organizedBy.role === 'collegeadmin' && (
                                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    College Admin
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                  <span className="text-sm">
                                    {new Date(ev.date).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                  <MapPinIcon className="h-4 w-4 ml-4 mr-2" />
                                  <span className="text-sm">{ev.location}</span>
                                </div>
                                
                                {ev.description && (
                                  <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">{ev.description}</p>
                                )}
                                
                                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                  {ev.department && (
                                    <span className="bg-gray-200 px-2 py-1 rounded">Department: {ev.department}</span>
                                  )}
                                  {ev.branch && (
                                    <span className="bg-gray-200 px-2 py-1 rounded">Branch: {ev.branch}</span>
                                  )}
                                  {ev.targetAudience && ev.targetAudience.length > 0 && (
                                    <span className="bg-gray-200 px-2 py-1 rounded">For: {ev.targetAudience.join(', ')}</span>
                                  )}
                                  {ev.organizedBy && (
                                    <span className="bg-gray-200 px-2 py-1 rounded">By: {ev.organizedBy.name} ({ev.organizedBy.role})</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {canEditOrDelete(ev) && (
                              <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-4">
                                <button
                                  onClick={() => handleEditClick(ev)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md flex items-center"
                                >
                                  <PencilSquareIcon className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(ev._id)}
                                  disabled={loading}
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <TrashIcon className="h-4 w-4 mr-1" />
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
        </div>
      ) : (
        <NotLoggedIn text="Event" />
      )}
      
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <PencilSquareIcon className="h-6 w-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Edit Event</h3>
                </div>
              </div>
              
              <form onSubmit={handleEditSubmit} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                  <input 
                    name="title" 
                    value={editForm.title} 
                    onChange={handleEditChange} 
                    placeholder="Enter event title" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input 
                    name="date" 
                    value={editForm.date} 
                    onChange={handleEditChange} 
                    type="date" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input 
                    name="location" 
                    value={editForm.location} 
                    onChange={handleEditChange} 
                    placeholder="Enter event location" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
                  <div className="space-y-2">
                    {['student', 'alumni', 'professor'].map((audience) => (
                      <label key={audience} className="flex items-center">
                        <input
                          type="checkbox"
                          name="targetAudience"
                          value={audience}
                          checked={editForm.targetAudience.includes(audience)}
                          onChange={handleEditTargetAudienceChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{audience}s</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch (Optional)</label>
                  <input 
                    name="branch" 
                    value={editForm.branch} 
                    onChange={handleEditChange} 
                    placeholder="Specific branch"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    value={editForm.description} 
                    onChange={handleEditChange} 
                    placeholder="Enter event description" 
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
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
      <ToastContainer />
    </>
  );
}

export default Event;