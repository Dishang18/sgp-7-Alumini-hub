const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      name: { type: String, trim: true },
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Alumni" }, // better type
      profilePicture: { type: String, trim: true },
    },
    headline: { type: String, trim: true }, // 👈 moved here
    content: { type: String, trim: true },
    image: { type: String, default: null }, // GridFS filename
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Alumni" }], // Store IDs of alumni who liked
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
