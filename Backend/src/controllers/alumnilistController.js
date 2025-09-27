// // const { Alumni } = require("../models/alumniModel");
// const { User } = require("../models/user");
// async function alumniListController(req, res) {
//   try {
//     // Fetch all approved alumni for meeting scheduling
//     const alumni = await User.find({ role: "alumni", isApproved: true });
//     res.status(200).json({
//       status: "success",
//       data: {
//         alumni,
//       },
//     });
//   } catch (error) {
//     console.error("Error during alumni list:", error);
//     throw error;
//   }
// }
// module.exports = alumniListController;



// const { Alumni } = require("../models/alumniModel");
const { User } = require("../models/user");
async function alumniListController(req, res) {
  try {
    // Build filter based on user role
    let filter = { role: "alumni", isApproved: true };
    
    if (req.user.role === "collegeadmin") {
      // College admin can only see alumni from their department
      filter.department = { $regex: new RegExp(`^${req.user.department}$`, 'i') };
    } else if (req.user.role === "professor") {
      // Professor can only see alumni from their department and branch
      filter.department = { $regex: new RegExp(`^${req.user.department}$`, 'i') };
      filter.branch = { $regex: new RegExp(`^${req.user.branch}$`, 'i') };
    }
    // Admin can see all alumni (no additional filter)
    
    console.log('Alumni list request:', {
      userRole: req.user.role,
      userDepartment: req.user.department,
      userBranch: req.user.branch,
      filter: filter
    });
    
    const alumni = await User.find(filter, { firstName: 1, lastName: 1, email: 1, department: 1, branch: 1 });
    
    // Add fullName field for convenience
    const alumniList = alumni.map(a => ({
      _id: a._id,
      fullName: (a.firstName || '') + (a.lastName ? ' ' + a.lastName : ''),
      email: a.email,
      department: a.department,
      branch: a.branch
    }));
    
    console.log('Alumni list result:', {
      totalFound: alumniList.length,
      alumni: alumniList.map(a => ({ name: a.fullName, department: a.department, branch: a.branch }))
    });
    
    res.status(200).json({
      status: "success",
      data: {
        alumni: alumniList,
      },
    });
  } catch (error) {
    console.error("Error during alumni list:", error);
    throw error;
  }
}
module.exports = alumniListController;
