const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // memory storage for GridFS

const uploadToGridFS = require("../util/uploadToGridFS"); // your GridFS upload helper

// --------- AUTH CONTROLLERS ---------
const {
  AlumniSignup,
  AlumniLogin,
  getAlumni,
  updateAlumni,
  getAlumniById,
  getAllAlumni,
  changePassword,
  deleteAccount,
} = require("../controllers/alumniControllers/Auth");

// --------- EVENT CONTROLLERS ---------
const {
  getEvents,
  createEvent,
  getEventById,
  registerForEvent,
} = require("../controllers/alumniControllers/Events");

// --------- POST CONTROLLERS ---------
const {
  getPosts,
  createPost,
  getImage,
  addComment,
  toggleLike,
} = require("../controllers/alumniControllers/Posts");

const alumniMiddleware = require("../middlewares/alumniMiddleware");

// ====================== AUTH ROUTES ======================
router.post("/signup", AlumniSignup);
router.post("/login", AlumniLogin);
router.post("/get-alumni", alumniMiddleware, getAlumni);
router.get("/get-alumni/:id", alumniMiddleware, getAlumniById);

router.post(
  "/update-alumni",
  alumniMiddleware,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      if (req.files.profilePicture) {
        req.body.profilePictureId = await uploadToGridFS(
          req.files.profilePicture[0]
        );
      }
      if (req.files.resume) {
        req.body.resumeId = await uploadToGridFS(req.files.resume[0]);
      }
      updateAlumni(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/get-all-alumni", alumniMiddleware, getAllAlumni);
router.post("/change-password", alumniMiddleware, changePassword);
router.delete("/delete-account", alumniMiddleware, deleteAccount);

// ====================== EVENTS ROUTES ======================
router.get("/events", alumniMiddleware, getEvents);

router.post(
  "/create-event",
  alumniMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {
        req.body.imageId = await uploadToGridFS(req.file);
      }
      createEvent(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/event/:id", alumniMiddleware, getEventById);
router.post("/event/register", alumniMiddleware, registerForEvent);

// ====================== POSTS ROUTES ======================
router.get("/posts", alumniMiddleware, getPosts);

router.post(
  "/create-post",
  alumniMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {
        req.body.imageId = await uploadToGridFS(req.file);
      }
      createPost(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

// ✅ Serve images from GridFS
router.get("/posts/image/:id", getImage);

// ✅ Add comment to post
router.post("/posts/:postId/comment", alumniMiddleware, addComment);

// ✅ Like/unlike post
router.post("/posts/:postId/like", alumniMiddleware, toggleLike);

module.exports = router;
