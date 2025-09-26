

import React, { useEffect, useState } from 'react';
import { getLoggedIn, getUserData } from '../services/authService';
import NotLoggedIn from './helper/NotLoggedIn';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import { CalendarDaysIcon, MapPinIcon, PencilSquareIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/solid';

function Event() {
  const loggedIn = getLoggedIn();
  const user = getUserData();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ 
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
      const res = await fetchEvents();
      setEvents(res.data.data.events);
      
      // Show meta message if available
      if (res.data.meta && res.data.meta.message) {
        console.log('Events loaded:', res.data.meta.message);
      }
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTargetAudienceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setForm({ ...form, targetAudience: [...form.targetAudience, value] });
    } else {
      setForm({ ...form, targetAudience: form.targetAudience.filter(audience => audience !== value) });
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
      await createEvent(form);
      toast.success('Event created!');
      setForm({ title: '', date: '', location: '', description: '', targetAudience: ['student'], branch: '' });
      // Refresh events
      await loadEvents();
    } catch (err) {
      toast.error('Failed to create event');
    }
    setLoading(false);
  };

  const canCreate = user && (user.role === 'collegeadmin' || user.role === 'professor');
  const isAdmin = user && user.role === 'admin';

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
        await loadEvents(); // Refresh events list
      } else {
        toast.error(result.message || 'Failed to cleanup events');
      }
    } catch (error) {
      toast.error('Failed to cleanup events');
    }
    setLoading(false);
  };

  // Only allow edit/delete if event was created by the logged-in user (professor or collegeadmin)
  const canEditOrDelete = (ev) => {
    if (!user || !(user.role === 'collegeadmin' || user.role === 'professor')) return false;
    // createdBy may be an object (populated) or string (id)
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
      // Refresh events
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
      // Refresh events
      await loadEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center p-4">
      <ToastContainer />
      {loggedIn ? (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 w-full max-w-2xl">
            <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-4 sm:mb-0">Events</h1>
            {isAdmin && (
              <button
                onClick={handleManualCleanup}
                disabled={loading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {loading ? 'Cleaning...' : 'Cleanup Expired'}
              </button>
            )}
          </div>
          {canCreate && (
            <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg w-full max-w-lg animate-fade-in border-l-4 border-indigo-400">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
                <PencilSquareIcon className="h-6 w-6 text-indigo-400 mr-2" />
                Create Event
              </h2>
              
              {/* Department Info */}
              {user && user.department && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700">
                    <strong>Creating for:</strong> {user.department} Department
                    {user.branch && <span> - {user.branch} Branch</span>}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    Only users from your department will see this event
                  </p>
                </div>
              )}

              <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" required />
              
              <input name="date" value={form.date} onChange={handleChange} type="date" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" required />
              
              <input name="location" value={form.location} onChange={handleChange} placeholder="Event Location" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" required />
              
              {/* Target Audience Selection */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience:</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="targetAudience"
                      value="student"
                      checked={form.targetAudience.includes('student')}
                      onChange={handleTargetAudienceChange}
                      className="mr-2"
                    />
                    Students
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="targetAudience"
                      value="alumni"
                      checked={form.targetAudience.includes('alumni')}
                      onChange={handleTargetAudienceChange}
                      className="mr-2"
                    />
                    Alumni
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="targetAudience"
                      value="professor"
                      checked={form.targetAudience.includes('professor')}
                      onChange={handleTargetAudienceChange}
                      className="mr-2"
                    />
                    Professors
                  </label>
                </div>
              </div>

              {/* Branch Selection (Optional) */}
              <input 
                name="branch" 
                value={form.branch} 
                onChange={handleChange} 
                placeholder={`Specific Branch (optional, default: ${user && user.branch ? user.branch : 'All branches'})`}
                className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" 
              />
              
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Event Description" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" />
              
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors duration-200 w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          )}
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-2">No active events found</div>
                <div className="text-gray-400 text-sm">
                  Expired events are automatically removed. {canCreate && 'Create a new event to get started!'}
                </div>
              </div>
            ) : (
              events.map(ev => (
                <div key={ev._id} className="bg-white rounded-xl shadow-md p-5 flex flex-col animate-fade-in border-l-4 border-indigo-400">
                  <div className="flex items-center mb-2">
                    <CalendarDaysIcon className="h-5 w-5 text-indigo-400 mr-2" />
                    <span className="font-bold text-lg text-indigo-700">{ev.title}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <MapPinIcon className="h-4 w-4 text-indigo-300 mr-1" />
                    <span className="text-gray-600">{ev.location}</span>
                  </div>
                  <div className="text-gray-500 text-sm mb-2">
                    {new Date(ev.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  {ev.timeUntilExpiration && (
                    <div className="flex items-center mb-2">
                      <ClockIcon className="h-4 w-4 text-orange-400 mr-1" />
                      <span className="text-orange-600 text-sm font-medium">{ev.timeUntilExpiration}</span>
                    </div>
                  )}
                  <div className="text-gray-700 mb-2">{ev.description}</div>
                  
                  {/* Department and Target Audience Info */}
                  <div className="mt-2 space-y-1">
                    {ev.department && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Department:</span> {ev.department}
                        {ev.branch && <span> - {ev.branch}</span>}
                      </div>
                    )}
                    {ev.targetAudience && ev.targetAudience.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">For:</span> {ev.targetAudience.join(', ')}
                      </div>
                    )}
                    {ev.organizedBy && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Organized by:</span> {ev.organizedBy.name} ({ev.organizedBy.role})
                      </div>
                    )}
                  </div>
                  {canEditOrDelete(ev) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        onClick={() => handleEditClick(ev)}
                      >Edit</button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(ev._id)}
                        disabled={loading}
                      >Delete</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <NotLoggedIn text="Event" />
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><PencilSquareIcon className="h-6 w-6 text-indigo-400 mr-2" />Edit Event</h2>
            <form onSubmit={handleEditSubmit}>
              <input name="title" value={editForm.title} onChange={handleEditChange} placeholder="Title" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" required />
              <input name="date" value={editForm.date} onChange={handleEditChange} type="date" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" required />
              <input name="location" value={editForm.location} onChange={handleEditChange} placeholder="Location" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" required />
              
              {/* Target Audience Selection for Edit */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience:</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="targetAudience"
                      value="student"
                      checked={editForm.targetAudience.includes('student')}
                      onChange={handleEditTargetAudienceChange}
                      className="mr-2"
                    />
                    Students
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="targetAudience"
                      value="alumni"
                      checked={editForm.targetAudience.includes('alumni')}
                      onChange={handleEditTargetAudienceChange}
                      className="mr-2"
                    />
                    Alumni
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="targetAudience"
                      value="professor"
                      checked={editForm.targetAudience.includes('professor')}
                      onChange={handleEditTargetAudienceChange}
                      className="mr-2"
                    />
                    Professors
                  </label>
                </div>
              </div>

              {/* Branch Selection for Edit */}
              <input 
                name="branch" 
                value={editForm.branch} 
                onChange={handleEditChange} 
                placeholder="Specific Branch (optional)"
                className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" 
              />
              
              <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Description" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-indigo-300" />
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors duration-200" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500 transition-colors duration-200" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Event;
