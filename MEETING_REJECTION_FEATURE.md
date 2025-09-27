# Meeting Rejection Reason Feature

## Overview
Alumni are now required to provide a reason when rejecting meeting requests from college admins and professors. This helps college admins understand why meetings were declined and plan accordingly.

## Features Added

### Backend Changes
1. **Meeting Model**: Added `rejectionReason` field to store the reason provided by alumni
2. **Meeting Controller**: 
   - `rejectMeeting` function now requires and validates rejection reason
   - Returns error if rejection reason is empty or missing
3. **Department Filtering**: 
   - College admins can only see and create meetings with alumni from their department
   - Students only see approved meetings from their department

### Frontend Changes  
1. **Rejection Modal**: 
   - Alumni see a modal when clicking "Reject" button
   - Required to enter a reason before rejecting
   - Cannot submit with empty reason
2. **Rejection Reason Display**:
   - Rejected meetings show the rejection reason in a red-bordered box
   - Visible to college admins who created the meeting
3. **User Information**: 
   - Clear messages for each role about their access level
   - College admins see note about rejection reasons being required

## How It Works

### For Alumni:
1. Alumni receive meeting requests from college admins/professors
2. When rejecting, they must click "Reject" button which opens a modal
3. They must provide a reason (minimum 1 character, whitespace trimmed)
4. Reason is saved and displayed to the meeting creator

### For College Admins:
1. Can only create meetings with alumni from their department
2. See rejection reasons when alumni reject their meeting requests
3. Can use this feedback to improve future meeting requests

### For Students:
1. Can only see approved meetings from their department
2. No access to create or manage meetings

## API Endpoints

### Reject Meeting
- **Endpoint**: `PATCH /meeting/:id/reject`
- **Body**: `{ "rejectionReason": "string" }`
- **Validation**: Rejection reason is required and cannot be empty
- **Response**: Meeting object with updated status and rejection reason

## Database Schema

```javascript
// Meeting Schema additions
{
  // ... existing fields
  rejectionReason: { type: String }, // New field for rejection reason
}
```

## Usage Examples

### Valid Rejection Request
```json
{
  "rejectionReason": "I have a scheduling conflict during that time."
}
```

### Invalid Rejection Request (will fail)
```json
{
  "rejectionReason": ""
}
```

## Benefits
- **Better Communication**: College admins understand why meetings are rejected
- **Improved Planning**: Can adjust meeting requests based on feedback
- **Professional Interaction**: Maintains professional communication standards
- **Department Isolation**: Ensures users only interact within their department