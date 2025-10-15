# Event Request/Approval System Implementation

## Completed Tasks
- [x] Create EventRequest Model (`Backend/src/models/eventRequestModel.js`)
- [x] Add controller methods to `Backend/src/controllers/eventController.js`:
  - [x] createEventRequestController
  - [x] getEventRequestsController
  - [x] approveEventRequestController
  - [x] rejectEventRequestController
- [x] Add routes to `Backend/src/routes/eventRoutes.js`:
  - [x] POST /request/create
  - [x] GET /requests
  - [x] PUT /request/:id/approve
  - [x] PUT /request/:id/reject
- [x] Update event creation logic in `createEventController` to handle approved requests
- [x] Add validation to prevent direct inter-college event creation
- [x] Update `Backend/src/models/index.js` if needed for exports

## Pending Tasks
- [ ] Test the approval workflow between different college admins

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
        // refresh events after cleanup
        await fetchEvents();
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
