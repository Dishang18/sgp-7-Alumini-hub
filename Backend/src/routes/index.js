const express = require("express");
// const mongoose = require('mongoose');
const router = express.Router();
// const registerRoutes = require('./registerRoutes');
const registerRoute = require("./registerRoute");
const loginRoute = require("./loginRoute");
const alumniListRoute = require("./alumniListRoute");
const jobRoutes = require("./jobRoutes");
const eventRoutes = require("./eventRoutes");
const meetingRoutes = require("./meetingRoutes");
const userRoutes = require("./userRoutes");
const newsRoutes = require("./newsRoutes");
const newsletterRoutes = require("./newsletterRoutes");
const postRoutes = require("./postRoutes");
const professorApprovalRoutes = require("./professorApprovalRoutes");

router.get("/", (req, res) => {
  console.log("Server is up and running.");
  res.send("Server is up and running.");
});

router.use("/register", registerRoute);
router.use("/event", eventRoutes);
router.use("/posts", postRoutes);
router.use("/meeting", meetingRoutes);
router.use("/users", userRoutes); // admin-only endpoints
router.use("/news", newsRoutes);
router.use("/newsletter", newsletterRoutes);
console.log("registerRoute 1");
router.use("/auth", loginRoute);
router.use("/", alumniListRoute);
router.use("/jobs", jobRoutes);
router.use("/professor", professorApprovalRoutes);
// router.use('/', Route);

module.exports = router;
