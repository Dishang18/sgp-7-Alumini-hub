const { Post } = require("../models/postModel");
const { User } = require("../models/user");

// Create a new post (Alumni and Students only)
const createPostController = async (req, res) => {
  try {
    // Only alumni and students can create posts
    if (!(req.user.role === "alumni" || req.user.role === "student")) {
      return res.status(403).json({
        status: "fail",
        message: "Only alumni and students can create posts."
      });
    }

    const { title, content, postType, tags, visibility } = req.body;
    const authorId = req.user._id;
    const userDepartment = req.user.department;
    const userBranch = req.user.branch;

    if (!userDepartment) {
      return res.status(400).json({ 
        status: "fail", 
        message: "User must have a department to create posts." 
      });
    }

    // Create post with department-based targeting
    const postData = {
      title,
      content,
      author: authorId,
      department: userDepartment,
      postType: postType || "general",
      tags: tags || [],
      visibility: visibility || "department"
    };

    // Add branch if specified and user has one
    if (userBranch && (visibility === "branch" || !visibility)) {
      postData.branch = userBranch;
    }

    const post = await Post.create(postData);

    // Populate the created post with author details for response
    await post.populate("author", "firstName lastName email role department branch");

    res.status(201).json({
      status: "success",
      data: {
        post: post
      },
      message: "Post created successfully!"
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all posts for user's department
const getAllPostsController = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userDepartment = req.user.department;
    const userBranch = req.user.branch;

    // Safety check for user object
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "User not authenticated"
      });
    }

    let postQuery = {};

    // Different access levels based on role
    if (userRole === "admin") {
      // Admin sees all posts
      postQuery = { isActive: true };
    } else if (userRole === "collegeadmin") {
      // College admin sees posts from their department
      postQuery = {
        department: userDepartment,
        isActive: true
      };
    } else if (userRole === "alumni" || userRole === "student") {
      // Alumni and students see posts from their department
      postQuery = {
        $and: [
          { isActive: true },
          {
            $or: [
              { department: userDepartment, visibility: "department" },
              { department: userDepartment, branch: userBranch, visibility: "branch" },
              { visibility: "public" }
            ]
          }
        ]
      };
    } else {
      return res.status(403).json({
        status: "fail",
        message: "Access denied. Invalid role for viewing posts."
      });
    }

    console.log("Post query:", JSON.stringify(postQuery, null, 2));

    // Fetch posts with author details
    const posts = await Post.find(postQuery)
      .populate("author", "firstName lastName email role department branch")
      .populate("likes.user", "firstName lastName")
      .populate("comments.user", "firstName lastName")
      .sort({ createdAt: -1 }); // Most recent posts first

    // Process posts to add user interaction status
    const processedPosts = posts.map(post => {
      const postObj = post.toObject();
      
      // Check if current user has liked this post
      postObj.isLikedByUser = post.likes.some(like => 
        like.user && like.user._id.toString() === req.user._id.toString()
      );
      
      // Add safe author information
      postObj.authorInfo = post.author ? {
        name: `${post.author.firstName || 'Unknown'} ${post.author.lastName || 'User'}`,
        role: post.author.role || 'Unknown',
        department: post.author.department || 'Unknown',
        branch: post.author.branch || null
      } : {
        name: 'Deleted User',
        role: 'Unknown',
        department: 'Unknown',
        branch: null
      };

      return postObj;
    });

    res.status(200).json({
      status: "success",
      data: {
        posts: processedPosts,
      },
      meta: {
        totalPosts: processedPosts.length,
        userDepartment: userDepartment,
        userRole: userRole,
        filter: userRole === "admin" ? "All departments" : `${userDepartment} department`
      }
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Like/Unlike a post
const toggleLikePostController = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "Post not found"
      });
    }

    // Check if user already liked the post
    const existingLikeIndex = post.likes.findIndex(like => 
      like.user.toString() === userId.toString()
    );

    if (existingLikeIndex !== -1) {
      // Unlike the post
      post.likes.splice(existingLikeIndex, 1);
      await post.save();
      
      res.status(200).json({
        status: "success",
        data: {
          action: "unliked",
          likeCount: post.likes.length
        },
        message: "Post unliked successfully"
      });
    } else {
      // Like the post
      post.likes.push({ user: userId });
      await post.save();
      
      res.status(200).json({
        status: "success",
        data: {
          action: "liked",
          likeCount: post.likes.length
        },
        message: "Post liked successfully"
      });
    }

  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error"
    });
  }
};

// Add comment to a post
const addCommentController = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Comment content is required"
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "fail", 
        message: "Post not found"
      });
    }

    // Add comment
    post.comments.push({
      user: userId,
      content: content.trim()
    });

    await post.save();

    // Populate the new comment with user details
    await post.populate("comments.user", "firstName lastName");

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      status: "success",
      data: {
        comment: newComment,
        commentCount: post.comments.length
      },
      message: "Comment added successfully"
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error"
    });
  }
};

// Delete a post (only by author or admin)
const deletePostController = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "Post not found"
      });
    }

    // Check if user can delete the post
    const canDelete = post.author.toString() === userId.toString() || userRole === "admin";
    
    if (!canDelete) {
      return res.status(403).json({
        status: "fail",
        message: "You can only delete your own posts"
      });
    }

    // Soft delete by setting isActive to false
    post.isActive = false;
    await post.save();

    res.status(200).json({
      status: "success",
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error"
    });
  }
};

// Get posts by specific user (profile view)
const getUserPostsController = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserDepartment = req.user.department;

    // Get target user to check department
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    // Users can only see posts from users in the same department (unless admin)
    if (req.user.role !== "admin" && targetUser.department !== currentUserDepartment) {
      return res.status(403).json({
        status: "fail",
        message: "You can only view posts from users in your department"
      });
    }

    const posts = await Post.find({
      author: targetUserId,
      isActive: true
    })
    .populate("author", "firstName lastName role department branch")
    .populate("likes.user", "firstName lastName")
    .populate("comments.user", "firstName lastName")
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: {
        posts: posts,
        author: {
          name: `${targetUser.firstName} ${targetUser.lastName}`,
          role: targetUser.role,
          department: targetUser.department
        }
      },
      meta: {
        totalPosts: posts.length
      }
    });

  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  createPostController,
  getAllPostsController,
  toggleLikePostController,
  addCommentController,
  deletePostController,
  getUserPostsController
};