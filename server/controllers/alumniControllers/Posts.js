const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const Post = require("../../models/PostModel");
const Alumni=require("../../models/AlumniModel")
const Comment=require("../../models/Comment");
const uploadToGridFS = require("../../util/uploadToGridFS");

let gfs;
const conn = mongoose.connection;

// Initialize GridFS once the connection is open
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads"); // must match the bucket name used in uploadToGridFS
});

// ==========================
// Get All Posts
// ==========================
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // latest first

    // Map posts to include full image URL instead of raw GridFS ID
    const formattedPosts = posts.map((post) => ({
      ...post._doc,
      image: post.image
        ? `${process.env.REACT_APP_BACKEND_URL}/alumni/posts/image/${post.image}`
        : null,
    }));

    res.status(200).json({
      message: "Posts retrieved successfully",
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      message: "Something went wrong while fetching posts",
      success: false,
      error: error.message,
    });
  }
};

// ==========================
// Create Post
// ==========================
const createPost = async (req, res) => {
  try {
    const { name, headline, profilePicture, content, createdBy } = req.body;
    const file = req.file;

    let imageId = null;

    if (file) {
      // Upload image to GridFS and get file ID
      imageId = await uploadToGridFS(file);
    }

    const newPost = new Post({
      user: {
        name,
        id: createdBy,
        profilePicture,
      },
      headline,
      content,
      image: imageId, // store GridFS ID
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      post: {
        ...savedPost._doc,
        image: imageId
          ? `${process.env.REACT_APP_BACKEND_URL}/alumni/posts/image/${imageId}`
          : null,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Something went wrong while creating post",
      success: false,
      error: error.message,
    });
  }
};

// ==========================
// Get Image by ID (GridFS)
// ==========================
const getImage = async (req, res) => {
  try {
    if (!gfs) {
      return res.status(500).json({ message: "GridFS not initialized" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const file = await gfs.files.findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ message: "No file found" });
    }

    const readstream = gfs.createReadStream({ _id: fileId });
    readstream.on("error", (err) => {
      console.error("GridFS Stream Error:", err);
      res.status(500).json({ message: "Error streaming file" });
    });

    res.set("Content-Type", file.contentType || "application/octet-stream");
    readstream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({
      message: "Something went wrong while fetching image",
      error: error.message,
    });
  }
};

// ==========================
// Add Comment to Post
// ==========================
  

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;   // ✅ properly destructure

    // Step 1: Check post/alumni exists
    const alumni = await Alumni.findById(postId);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    // Step 2: Create new comment
    const newComment = new Comment({
      alumni: alumni._id,
      text,
     // user: req.alumni._id,  // ✅ save which alumni wrote the comment
    });

    await newComment.save();

    // Step 3: Push comment into alumni.comments
    alumni.comments.push(newComment._id);
    await alumni.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error });
  }
};


// ==========================
// Like or Unlike Post
// ==========================
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
console.log("Incoming comment request:", { postId, text });
    const post = await Post.findById(postId);
    if (!post) {
      console.error("Post not found with id:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    //  return res.status(404).json({ success: false, message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


module.exports = {
  getPosts,
  createPost,
  getImage,
  addComment,
  toggleLike,
};
