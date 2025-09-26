const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adminName: {
    type: String,
    required: true,
  },
  // email, password, and role are now only in User model
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
module.exports = { Admin };
