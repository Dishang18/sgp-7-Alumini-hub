# College-Specific Admin System

## Overview
This system implements a hierarchical admin structure for the Alumni Connect platform where:

1. **Main Admin**: Has full access to manage all colleges and users
2. **College Admin**: Can only manage users from their specific college/department
3. **Professor**: Can manage students and alumni from their department and branch
4. **Students/Alumni**: Regular users who need approval

## Hierarchy & Permissions

### Main Admin (`role: 'admin'`)
- Can approve/delete/view all users from all colleges
- Can manage college admins
- Has system-wide permissions

### College Admin (`role: 'collegeadmin'`) 
- Can approve/delete/view only users from their `department`
- Can manage: `students`, `alumni`, `professors` from same department
- Cannot manage other `collegeadmin` or `admin` users
- Must have `department` field set during registration

### Professor (`role: 'professor'`)
- Can approve/view students and alumni from same `department` and `branch`
- Limited management permissions
- Must have `department` and `branch` fields set

## API Endpoints

### User Management
- `GET /users/all` - Get all users (filtered by role permissions)
- `GET /users/unapproved` - Get all unapproved users (filtered by role permissions)
- `GET /users/students/all` - Get all students (filtered by role permissions)
- `GET /users/students/unapproved` - Get unapproved students (filtered by role permissions)
- `POST /users/approve` - Approve users (with department restrictions for college admins)
- `DELETE /users/delete` - Delete users (with department restrictions for college admins)

### Key Filtering Logic

#### For College Admins:
```javascript
// Can only see/manage users from same department
const filter = {
  department: req.user.department,
  role: { $in: ['student', 'alumni', 'professor'] }
};
```

#### For Professors:
```javascript
// Can only see/manage users from same department and branch
const filter = {
  department: req.user.department,
  branch: req.user.branch,
  role: { $in: ['student', 'alumni'] }
};
```

## Database Schema Requirements

### User Model Fields:
- `department`: Required for collegeadmin, professor, alumni, student
- `branch`: Required for professor, alumni, student  
- `role`: admin, collegeadmin, professor, alumni, student
- `isApproved`: Boolean flag for approval status
- `collegeName`: Required for collegeadmin

## Frontend Integration

### UserManagement Component Updates Needed:
1. Filter users based on current user's role and department
2. Show different approval interfaces for main admin vs college admin
3. Add department-based filtering in user lists
4. Update approval buttons to handle department restrictions

### Recommended Frontend Changes:
```javascript
// In UserManagement.jsx - fetch users based on role
const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/users/all', 
      { withCredentials: true });
    setUsers(response.data.data.users);
  } catch (error) {
    // Handle error
  }
};

// Fetch unapproved users
const fetchUnapprovedUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/users/unapproved', 
      { withCredentials: true });
    setUnapprovedUsers(response.data.data.users);
  } catch (error) {
    // Handle error
  }
};
```

## Security Features
1. **Department-based access control**: College admins can only access their department's users
2. **Role hierarchy enforcement**: Lower roles cannot manage higher roles
3. **Audit logging**: All admin actions are logged with user and target details
4. **Input validation**: All user inputs are validated before processing

## Testing Scenarios
1. Create college admin for "Computer Science" department
2. Create students/alumni in same department - should be manageable
3. Create students/alumni in different department - should not be accessible
4. Test approval/deletion with cross-department attempts
5. Verify main admin can still access all users

## Migration Notes
- Existing users may need `department` field populated
- College admins need to be assigned to specific departments
- Consider data migration script for existing installations