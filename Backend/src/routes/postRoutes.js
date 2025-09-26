const express = require("express");
const router = express.Router();
const {
  createPostController,
  getAllPostsController,
  toggleLikePostController,
  addCommentController,
  deletePostController,
  getUserPostsController
} = require("../controllers/postController");
const checkAuth = require("../middlewares/checkAuth");

// Apply authentication middleware to all routes
router.use(checkAuth);

// CRUD routes for posts
router.post("/create", createPostController);
router.get("/all", getAllPostsController);
router.delete("/delete/:id", deletePostController);

// Interaction routes
router.post("/like/:id", toggleLikePostController);
router.post("/comment/:id", addCommentController);

// User-specific posts
router.get("/user/:userId", getUserPostsController);

module.exports = router;