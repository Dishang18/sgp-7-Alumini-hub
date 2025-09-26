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
    // Fetch all approved alumni for meeting scheduling
    const alumni = await User.find({ role: "alumni", isApproved: true }, { firstName: 1, lastName: 1, email: 1 });
    // Add fullName field for convenience
    const alumniList = alumni.map(a => ({
      _id: a._id,
      fullName: (a.firstName || '') + (a.lastName ? ' ' + a.lastName : ''),
      email: a.email
    }));
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
