const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  department: {
    type: String,
    required: true, // Posts are department-specific
  },
  branch: {
    type: String,
    required: false, // Optional for more specific targeting
  },
  postType: {
    type: String,
    enum: ["thought", "achievement", "experience", "opportunity", "question", "general"],
    default: "general",
  },
  tags: {
    type: [String],
    default: [],
    validate: [arrayLimit, 'Posts can have maximum 5 tags']
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ["department", "branch", "public"],
    default: "department"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validation function for tags array
function arrayLimit(val) {
  return val.length <= 5;
}

// Index for better query performance
postSchema.index({ department: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ postType: 1, department: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

module.exports = { Post };