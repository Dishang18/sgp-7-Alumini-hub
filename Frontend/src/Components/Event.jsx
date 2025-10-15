import React, { useEffect, useState } from 'react';
import { getLoggedIn, getUserData } from '../services/authService';
import NotLoggedIn from './helper/NotLoggedIn';
import { fetchEvents, createEvent, updateEvent, deleteEvent, createEventRequest, fetchEventRequests, approveEventRequest, rejectEventRequest, fetchCollegeAdmins } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import { CalendarDaysIcon, MapPinIcon, PencilSquareIcon, ClockIcon, TrashIcon, UserPlusIcon, CheckCircleIcon, XCircleIcon, PaperAirplaneIcon, InboxIcon } from '@heroicons/react/24/solid';

function Event() {
  const loggedIn = getLoggedIn();
  const user = getUserData();
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
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    targetCollegeAdminId: '',
    title: '',
    date: '',
    location: '',
    description: '',
    targetAudience: ['student'],
    branch: ''
  });
  const [eventRequests, setEventRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [collegeAdmins, setCollegeAdmins] = useState([]);

  useEffect(() => {
    if (loggedIn) {
      loadEvents();
      if (user?.role === 'collegeadmin') {
        loadCollegeAdmins();
        loadEventRequests();
      }
    }
  }, [loggedIn, user]);

  const loadEvents = async () => {
    try {
      const res = await fetchEvents();
      setEvents(res.data.data.events);
      setEventsMeta(res.data.meta);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const loadCollegeAdmins = async () => {
    try {
      const res = await fetchCollegeAdmins();
      setCollegeAdmins(res.data.data.collegeAdmins);
    } catch (error) {
      console.error('Failed to load college admins:', error);
    }
  };

  const loadEventRequests = async () => {
    try {
      const res = await fetchEventRequests();
      setEventRequests(res.data.data.allRequests);
    } catch (error) {
      toast.error('Failed to fetch event requests');
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

  const handleRequestChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const handleRequestTargetAudienceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setRequestForm({ ...requestForm, targetAudience: [...requestForm.targetAudience, value] });
    } else {
      setRequestForm({ ...requestForm, targetAudience: requestForm.targetAudience.filter(audience => audience !== value) });
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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEventRequest(requestForm);
      toast.success('Event request sent!');
      setRequestForm({
        targetCollegeAdminId: '',
        title: '',
        date: '',
        location: '',
        description: '',
        targetAudience: ['student'],
        branch: ''
      });
      setShowRequestModal(false);
      await loadEventRequests();
    } catch (err) {
      toast.error('Failed to send event request');
    }
    setLoading(false);
  };

  const handleApproveRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this event request? This will create the event in your department.')) return;
    setLoading(true);
    try {
      await approveEventRequest(requestId);
      toast.success('Event request approved and event created!');
      await loadEventRequests();
      await loadEvents();
    } catch (err) {
      toast.error('Failed to approve event request');
    }
    setLoading(false);
  };

  const handleRejectRequest = async (requestId, rejectionReason) => {
    const reason = rejectionReason || prompt('Please provide a reason for rejection (optional):');
    setLoading(true);
    try {
      await rejectEventRequest(requestId, reason);
      toast.success('Event request rejected!');
      await loadEventRequests();
    } catch (err) {
      toast.error('Failed to reject event request');
    }
    setLoading(false);
  };

  const canCreate = user && (user.role === 'collegeadmin' || user.role === 'professor');
  const isAdmin = user && user.role === 'admin';

  // Helper: decide if current user can edit or delete a specific event
  const canEditOrDelete = (ev) => {
    if (!user || !ev) return false;
    // Admin can edit/delete all events
    if (user.role === 'admin') return true;
    // Creator can edit/delete their own events (compare string ids)
    try {
      const creatorId = ev.createdBy && (ev.createdBy._id ? ev.createdBy._id.toString() : ev.createdBy.toString());
      const currentUserId = user._id ? user._id.toString() : (user && user.toString && user.toString());
      if (creatorId && currentUserId && creatorId === currentUserId) return true;
    } catch (err) {
      // ignore and continue
    }
    // College admin can manage events in their department
    if (user.role === 'collegeadmin' && ev.department && user.department && ev.department.toLowerCase() === user.department.toLowerCase()) return true;
    // Professors can manage events they created (handled above) - otherwise no
    return false;
  };

  const handleOpenRequestModal = () => {
    // Prefill the request form from the normal create form so users don't need to retype
    setRequestForm(prev => ({
      ...prev,
      title: form.title,
      date: form.date,
      location: form.location,
      description: form.description,
      targetAudience: form.targetAudience,
      branch: form.branch
    }));
    setShowRequestModal(true);
  };

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
        toast.success(result.message || 'Cleanup complete');
        await loadEvents();
      } else {
        toast.error(result.message || 'Cleanup failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Cleanup failed');
    } finally {
      setLoading(false);
    }
  };

  // -- Edit / Delete handlers --
  const handleEditClick = (ev) => {
    setEditId(ev._id);
    setEditForm({
      title: ev.title || '',
      date: ev.date ? new Date(ev.date).toISOString().slice(0,10) : '',
      location: ev.location || '',
      description: ev.description || '',
      targetAudience: ev.targetAudience && ev.targetAudience.length > 0 ? ev.targetAudience : ['student'],
      branch: ev.branch || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editId) return toast.error('No event selected');
    setLoading(true);
    try {
      await updateEvent(editId, editForm);
      toast.success('Event updated');
      setShowEditModal(false);
      await loadEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Failed to update event');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      await loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
    }
    setLoading(false);
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {loggedIn ? (
        <>

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
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Event Description" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors duration-200 w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </button>
              {user && user.role === 'collegeadmin' && (
                <button type="button" onClick={handleOpenRequestModal} className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-colors duration-200">
                  Invite/Request Another College Admin
                </button>
              )}
              {user && user.role === 'collegeadmin' && (
                <button type="button" onClick={() => setShowRequestsModal(true)} className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors duration-200">
                  View Event Requests
                </button>
              )}
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
        <NotLoggedIn text="Event" redirectTo="/event" />
      )}
      {/* Edit Modal */}
      {/* Request Modal (invite another college admin to post) */}
      {showRequestModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><InboxIcon className="h-6 w-6 text-green-400 mr-2" />Send Event Request</h2>
            <form onSubmit={handleRequestSubmit}>
              <label className="block mb-2 font-medium">Target College Admin</label>
              <select name="targetCollegeAdminId" value={requestForm.targetCollegeAdminId} onChange={handleRequestChange} className="block w-full mb-3 p-2 border rounded">
                <option value="">-- Select College Admin --</option>
                {collegeAdmins.map(admin => (
                  <option key={admin._id} value={admin._id}>{admin.firstName} {admin.lastName} — {admin.department}</option>
                ))}
              </select>
              <input name="title" value={requestForm.title} onChange={handleRequestChange} placeholder="Event Title" className="block w-full mb-3 p-2 border rounded" required />
              <input name="date" value={requestForm.date} onChange={handleRequestChange} type="date" className="block w-full mb-3 p-2 border rounded" required />
              <input name="location" value={requestForm.location} onChange={handleRequestChange} placeholder="Event Location" className="block w-full mb-3 p-2 border rounded" required />
              <textarea name="description" value={requestForm.description} onChange={handleRequestChange} placeholder="Event Description" className="block w-full mb-3 p-2 border rounded" required />
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Sending...' : 'Send Request'}</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowRequestModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Requests list modal (received & sent) */}
      {showRequestsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center"><InboxIcon className="h-6 w-6 text-indigo-400 mr-2" />Event Requests</h2>
              <button className="text-gray-500" onClick={() => setShowRequestsModal(false)}>Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Received Requests</h3>
                {eventRequests && eventRequests.length > 0 ? (
                  eventRequests
                    .filter(r => r.targetCollegeAdmin && ((r.targetCollegeAdmin._id && r.targetCollegeAdmin._id.toString()) === (user && user._id?.toString())))
                    .map(r => (
                      <div key={r._id} className="mb-3 p-3 border rounded">
                        <div className="text-sm font-medium">{r.eventDetails.title}</div>
                        <div className="text-xs text-gray-500">From: {r.requester?.firstName} {r.requester?.lastName} — {r.requester?.collegeName}</div>
                        <div className="text-sm mt-2">{r.eventDetails.description}</div>
                        <div className="mt-2 flex gap-2">
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => handleApproveRequest(r._id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                              <button onClick={() => handleRejectRequest(r._id)} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                            </>
                          )}
                          {r.status !== 'pending' && (
                            <span className="text-sm text-gray-600">Status: {r.status}</span>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-gray-500">No received requests</div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sent Requests</h3>
                {eventRequests && eventRequests.length > 0 ? (
                  eventRequests
                    .filter(r => r.requester && ((r.requester._id && r.requester._id.toString()) === (user && user._id?.toString())))
                    .map(r => (
                      <div key={r._id} className="mb-3 p-3 border rounded">
                        <div className="text-sm font-medium">{r.eventDetails.title}</div>
                        <div className="text-xs text-gray-500">To: {r.targetCollegeAdmin?.firstName} {r.targetCollegeAdmin?.lastName} — {r.targetCollegeAdmin?.collegeName}</div>
                        <div className="text-sm mt-2">{r.eventDetails.description}</div>
                        <div className="mt-2 text-sm text-gray-600">Status: {r.status}</div>
                      </div>
                    ))
                ) : (
                  <div className="text-gray-500">No sent requests</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
              <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Description" className="block w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-300" required />
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