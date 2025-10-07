import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import NotLoggedIn from './helper/NotLoggedIn';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import { CalendarDaysIcon, MapPinIcon, PencilSquareIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/solid';

function Event() {
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);
  const [events, setEvents] = useState([]);
  const [eventsMeta, setEventsMeta] = useState(null);
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
      setEventsMeta(res.data.meta);
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
    if (!user || !(user.role === 'collegeadmin' || user.role === 'professor')) return false;
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 px-4 py-8 flex flex-col items-center">
      <ToastContainer />
      {loggedIn ? (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 w-full max-w-2xl">
            <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-4 sm:mb-0 w-full">
              Events
            </h1>
            {isAdmin && (
              <div className="sm:ml-4 flex justify-center sm:justify-end w-full sm:w-auto items-center">
                <button
                  onClick={handleManualCleanup}
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  {loading ? 'Cleaning...' : 'Cleanup Expired'}
                </button>
              </div>
            )}
          </div>
          {/* Admin Summary */}
          {isAdmin && eventsMeta && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 w-full max-w-2xl">
              <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                📊 Admin Overview - All Department Events
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Total Events:</strong> {eventsMeta.totalEvents}</p>
                {eventsMeta.collegeAdminEventsCount > 0 && (
                  <p><strong>Events by College Admins:</strong> 
                    <span className="ml-1 bg-green-200 px-2 py-0.5 rounded text-green-800 font-medium">
                      {eventsMeta.collegeAdminEventsCount}
                    </span>
                  </p>
                )}
                {eventsMeta.departmentBreakdown && Object.keys(eventsMeta.departmentBreakdown).length > 0 && (
                  <div>
                    <p><strong>By Department:</strong></p>
                    <div className="ml-4 mt-1">
                      {Object.entries(eventsMeta.departmentBreakdown).map(([dept, count]) => (
                        <span key={dept} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-2 mb-1">
                          {dept}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-green-600 mt-2 italic">
                💡 Events with green borders are from college admins of different departments
              </p>
            </div>
          )}
          {canCreate && (
            <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg w-full max-w-lg border-l-4 border-blue-400">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-700">
                <PencilSquareIcon className="h-6 w-6 text-blue-400 mr-2" />
                Create Event
              </h2>
              {user && user.department && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Creating for:</strong> {user.department} Department
                    {user.branch && <span> - {user.branch} Branch</span>}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Only users from your department will see this event
                  </p>
                </div>
              )}
              <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
              <input name="date" value={form.date} onChange={handleChange} type="date" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
              <input name="location" value={form.location} onChange={handleChange} placeholder="Event Location" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
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
              <input 
                name="branch" 
                value={form.branch} 
                onChange={handleChange} 
                placeholder={`Specific Branch (optional, default: ${user && user.branch ? user.branch : 'All branches'})`}
                className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" 
              />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Event Description" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors duration-200 w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          )}
          <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-2">No active events found</div>
                <div className="text-gray-400 text-sm">
                  Expired events are automatically removed. {canCreate && 'Create a new event to get started!'}
                </div>
              </div>
            ) : (
              events.map(ev => {
                const isFromDifferentDept = isAdmin && user.department !== ev.department && ev.department;
                const borderColor = isFromDifferentDept ? 'border-green-400' : 'border-blue-400';
                return (
                  <div key={ev._id} className={`bg-white rounded-xl shadow-md p-5 flex flex-col border-l-4 ${borderColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 text-blue-400 mr-2" />
                        <span className="font-bold text-lg text-blue-700">{ev.title}</span>
                      </div>
                      {isAdmin && ev.organizedBy && ev.organizedBy.role === 'collegeadmin' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          College Admin Event
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mb-1">
                      <MapPinIcon className="h-4 w-4 text-blue-300 mr-1" />
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
                    <div className="mt-2 space-y-1">
                      {ev.department && (
                        <div className={`text-xs ${isFromDifferentDept ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                          <span className="font-medium">Department:</span> {ev.department}
                          {ev.branch && <span> - {ev.branch}</span>}
                          {isFromDifferentDept && <span className="ml-2 text-green-500">• External Dept</span>}
                        </div>
                      )}
                      {ev.targetAudience && ev.targetAudience.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">For:</span> {ev.targetAudience.join(', ')}
                        </div>
                      )}
                      {ev.organizedBy && (
                        <div className={`text-xs ${isAdmin ? 'text-gray-600' : 'text-gray-500'}`}>
                          <span className="font-medium">Organized by:</span> {ev.organizedBy.name} 
                          <span className={`ml-1 ${ev.organizedBy.role === 'collegeadmin' && isAdmin ? 'text-green-600 font-medium' : ''}`}>
                            ({ev.organizedBy.role})
                          </span>
                          {isAdmin && ev.organizedBy.department && ev.organizedBy.department !== 'Unknown' && (
                            <span className="text-gray-500"> - {ev.organizedBy.department} Dept</span>
                          )}
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
                );
              })
            )}
          </section>
        </>
      ) : (
        <NotLoggedIn text="Event" />
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><PencilSquareIcon className="h-6 w-6 text-blue-400 mr-2" />Edit Event</h2>
            <form onSubmit={handleEditSubmit}>
              <input name="title" value={editForm.title} onChange={handleEditChange} placeholder="Title" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
              <input name="date" value={editForm.date} onChange={handleEditChange} type="date" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
              <input name="location" value={editForm.location} onChange={handleEditChange} placeholder="Location" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
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
              <input 
                name="branch" 
                value={editForm.branch} 
                onChange={handleEditChange} 
                placeholder="Specific Branch (optional)"
                className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" 
              />
              <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Description" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors duration-200" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500 transition-colors duration-200" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Event;