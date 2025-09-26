const {Alumni} = require("./alumniModel");
const { Admin } = require("./adminModel");
const { CollegeAdmin } = require("./collegeModel");
const { User } = require("./user");
const Student = require("./studentModel");

const { Professor } = require("./professorModel");
const {Event }= require("./eventModel");

module.exports = {
  Alumni,
  Admin,
  CollegeAdmin,
  User,
  Professor,
  Event,
  Student,
};
